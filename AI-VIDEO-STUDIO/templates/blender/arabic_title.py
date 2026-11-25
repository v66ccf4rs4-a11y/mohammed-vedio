"""Blender 3D Arabic title shot: extruded calligraphy, camera dolly, depth of field, light.

Run with Blender:   blender -b -P arabic_title.py -- --text "..." --out frames_dir [--font F]
or with bpy module: python arabic_title.py --text "..." --out frames_dir

Blender's text engine has no HarfBuzz shaping/RTL, so Arabic is pre-shaped with
arabic_reshaper (contextual letter forms + lam-alef ligatures) and python-bidi (visual
RTL order). Diacritics are removed for 3D text because Blender cannot position marks.
"""
import argparse
import math
import re
import sys
from pathlib import Path

import bpy

import arabic_reshaper
from bidi import get_display

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
ap = argparse.ArgumentParser()
ap.add_argument("--text", default="هنا تبدأ الحكاية")
ap.add_argument("--font", default=str(Path(__file__).resolve().parents[2] / "fonts" / "Amiri-Bold.ttf"))
ap.add_argument("--out", default=str(Path(__file__).resolve().parents[2] / "previews" / "blender"))
ap.add_argument("--width", type=int, default=1080)
ap.add_argument("--height", type=int, default=1920)
ap.add_argument("--frames", type=int, default=90)
ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--engine", default="auto", help="auto | CYCLES | BLENDER_EEVEE")
ap.add_argument("--samples", type=int, default=32)
ap.add_argument("--scale", type=int, default=100, help="resolution percentage")
args = ap.parse_args(argv)

DIAC = re.compile(r"[ؐ-ًؚ-ٰٟۖ-ۭ]")


def shape_arabic(s: str) -> str:
    reshaper = arabic_reshaper.ArabicReshaper({"delete_harakat": True, "support_ligatures": True})
    return get_display(reshaper.reshape(DIAC.sub("", s)))


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.resolution_x, scene.render.resolution_y = args.width, args.height
scene.render.resolution_percentage = args.scale
scene.render.fps = args.fps
scene.frame_start, scene.frame_end = 1, args.frames
engine = args.engine
if engine == "auto":
    engine = "CYCLES"
scene.render.engine = engine
if engine == "CYCLES":
    scene.cycles.samples = args.samples
    scene.cycles.use_denoising = True
    prefs = bpy.context.preferences.addons.get("cycles")
    scene.cycles.device = "CPU"
    if prefs:
        for dev_type in ("OPTIX", "CUDA", "HIP", "ONEAPI"):
            try:
                prefs.preferences.compute_device_type = dev_type
                prefs.preferences.get_devices()
                if any(d.type == dev_type for d in prefs.preferences.devices):
                    for d in prefs.preferences.devices:
                        d.use = True
                    scene.cycles.device = "GPU"
                    break
            except Exception:  # noqa: BLE001
                continue
scene.render.use_motion_blur = True
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Medium High Contrast"

# World: dusk gradient sky
world = bpy.data.worlds.new("Sky")
scene.world = world
world.use_nodes = True
nt = world.node_tree
bg = nt.nodes["Background"]
grad = nt.nodes.new("ShaderNodeTexGradient")
ramp = nt.nodes.new("ShaderNodeValToRGB")
tc = nt.nodes.new("ShaderNodeTexCoord")
mapn = nt.nodes.new("ShaderNodeMapping")
mapn.inputs["Rotation"].default_value = (0, math.radians(-90), 0)
nt.links.new(tc.outputs["Generated"], mapn.inputs["Vector"])
nt.links.new(mapn.outputs["Vector"], grad.inputs["Vector"])
nt.links.new(grad.outputs["Fac"], ramp.inputs["Fac"])
ramp.color_ramp.elements[0].color = (0.55, 0.36, 0.28, 1)
ramp.color_ramp.elements[1].color = (0.05, 0.09, 0.2, 1)
nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
bg.inputs["Strength"].default_value = 0.8

# Ground (sand) with soft dunes displacement
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, -1.6))
ground = bpy.context.object
mod = ground.modifiers.new("sub", "SUBSURF")
mod.levels = mod.render_levels = 4
mod.subdivision_type = "SIMPLE"
tex = bpy.data.textures.new("dunes", "CLOUDS")
tex.noise_scale = 6
disp = ground.modifiers.new("disp", "DISPLACE")
disp.texture = tex
disp.strength = 1.4
sand = bpy.data.materials.new("Sand")
sand.use_nodes = True
sand.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.62, 0.45, 0.32, 1)
sand.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9
ground.data.materials.append(sand)

# Arabic 3D text
font = bpy.data.fonts.load(args.font)
curve = bpy.data.curves.new("Title", "FONT")
curve.body = shape_arabic(args.text)
curve.font = font
curve.align_x = "CENTER"
curve.align_y = "CENTER"
curve.size = 1.0
curve.extrude = 0.06
curve.bevel_depth = 0.008
title = bpy.data.objects.new("Title", curve)
scene.collection.objects.link(title)
title.rotation_euler = (math.radians(90), 0, 0)
mat = bpy.data.materials.new("Ivory")
mat.use_nodes = True
p = mat.node_tree.nodes["Principled BSDF"]
p.inputs["Base Color"].default_value = (0.93, 0.9, 0.85, 1)
p.inputs["Roughness"].default_value = 0.35
curve.materials.append(mat)
# fit text width to frame
bpy.context.view_layer.update()
w = title.dimensions.x or 1
fit = 2.4 * min(1.0, args.width / args.height * 1.5)  # visible width at the focus distance
title.scale = [fit / w] * 3

# Animate text rising out of haze
title.location = (0, 0, -0.35)
title.keyframe_insert("location", frame=1)
title.location = (0, 0, 0)
title.keyframe_insert("location", frame=int(args.frames * 0.45))

# Light: low sun (side light gives the calligraphy depth)
sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
sun.data.energy = 3.5
sun.data.color = (1.0, 0.9, 0.8)
sun.rotation_euler = (math.radians(70), 0, math.radians(-50))
scene.collection.objects.link(sun)
fill = bpy.data.objects.new("Fill", bpy.data.lights.new("Fill", "AREA"))
fill.data.energy = 120
fill.data.color = (0.6, 0.75, 1.0)
fill.location = (2, -4, 2)
scene.collection.objects.link(fill)

# Camera: dolly-in with shallow depth of field focused on the title
cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))
scene.collection.objects.link(cam)
scene.camera = cam
cam.data.lens = 50
cam.data.dof.use_dof = True
cam.data.dof.focus_object = title
cam.data.dof.aperture_fstop = 2.0
cam.rotation_euler = (math.radians(88), 0, 0)
cam.location = (0.35, -9.5, 0.2)
cam.keyframe_insert("location", frame=1)
cam.location = (-0.15, -7.2, 0.05)
cam.keyframe_insert("location", frame=args.frames)
for fc in (cam.animation_data.action.fcurves if hasattr(cam.animation_data.action, "fcurves") else []):
    for kp in fc.keyframe_points:
        kp.interpolation = "SINE"

out = Path(args.out)
out.mkdir(parents=True, exist_ok=True)
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(out / "frame_")
bpy.ops.render.render(animation=True)
print("BLENDER_RENDER_OK", out)
