"""
=============================================================================
  IRON MAN MARK I ARC REACTOR — Blender Python Script
  Film-quality, MCU-accurate, Cinematic Render Setup
  
  HOW TO USE:
    1. Open Blender (3.6+ or 4.x)
    2. Go to Scripting workspace
    3. Open this file → Run Script
    OR:
    blender --background --python arc_reactor_mark1.py
    
  WHAT IT BUILDS:
    - Full concentric-ring arc reactor geometry
    - Brushed metal / copper / glass / emissive materials (PBR)
    - Cinematic HDRI + studio lighting rig
    - Cycles render setup (4K capable)
    - Depth of field hero camera
    - Slow rotation animation (optional)
    - Fully organized named collections
=============================================================================
"""

import bpy
import bmesh
import math
import mathutils
from mathutils import Vector, Matrix, Euler

# ─────────────────────────────────────────────────
#   UTILITY HELPERS
# ─────────────────────────────────────────────────

def deselect_all():
    bpy.ops.object.select_all(action='DESELECT')

def active(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

def link_to(obj, col):
    """Link object to collection, unlink from others."""
    for c in obj.users_collection:
        c.objects.unlink(obj)
    col.objects.link(obj)

def new_collection(name, parent=None):
    col = bpy.data.collections.new(name)
    if parent:
        parent.children.link(col)
    else:
        bpy.context.scene.collection.children.link(col)
    return col

def apply_modifiers(obj):
    deselect_all()
    active(obj)
    for mod in obj.modifiers:
        bpy.ops.object.modifier_apply(modifier=mod.name)

def set_smooth(obj, angle_deg=30):
    deselect_all()
    active(obj)
    bpy.ops.object.shade_smooth()
    # Blender 4.1+ removed use_auto_smooth; use the shade_auto_smooth operator when available
    if hasattr(obj.data, 'use_auto_smooth'):
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = math.radians(angle_deg)
    elif hasattr(bpy.ops.object, 'shade_auto_smooth'):
        try:
            bpy.ops.object.shade_auto_smooth(angle=math.radians(angle_deg))
        except Exception:
            pass


# ─────────────────────────────────────────────────
#   SCENE RESET
# ─────────────────────────────────────────────────

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh)
    for light in list(bpy.data.lights):
        bpy.data.lights.remove(light)
    for cam in list(bpy.data.cameras):
        bpy.data.cameras.remove(cam)


# ─────────────────────────────────────────────────
#   MATERIALS
# ─────────────────────────────────────────────────

def make_brushed_aluminum():
    mat = bpy.data.materials.new("MAT_BrushedAluminum")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out    = nodes.new('ShaderNodeOutputMaterial')
    bsdf   = nodes.new('ShaderNodeBsdfPrincipled')
    tex_coord = nodes.new('ShaderNodeTexCoord')
    mapping   = nodes.new('ShaderNodeMapping')
    noise     = nodes.new('ShaderNodeTexNoise')
    wave      = nodes.new('ShaderNodeTexWave')
    mix_rgb   = nodes.new('ShaderNodeMixRGB')
    scratch_n = nodes.new('ShaderNodeTexNoise')
    bump      = nodes.new('ShaderNodeBump')
    ramp      = nodes.new('ShaderNodeValToRGB')

    # Brushed anisotropic look via wave texture
    wave.inputs['Scale'].default_value      = 120
    wave.inputs['Distortion'].default_value = 3.5
    wave.inputs['Detail'].default_value     = 8
    wave.inputs['Detail Scale'].default_value = 4
    wave.inputs['Detail Roughness'].default_value = 0.6

    noise.inputs['Scale'].default_value    = 80
    noise.inputs['Detail'].default_value   = 12
    noise.inputs['Roughness'].default_value= 0.6

    scratch_n.inputs['Scale'].default_value    = 200
    scratch_n.inputs['Detail'].default_value   = 16
    scratch_n.inputs['Roughness'].default_value= 0.8

    # Color ramp for slight tonal variation
    ramp.color_ramp.elements[0].position = 0.4
    ramp.color_ramp.elements[0].color    = (0.55, 0.55, 0.58, 1)
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color    = (0.75, 0.76, 0.78, 1)

    mix_rgb.blend_type = 'MULTIPLY'
    mix_rgb.inputs['Fac'].default_value = 0.25

    bump.inputs['Strength'].default_value = 0.08
    bump.inputs['Distance'].default_value = 0.002

    bsdf.inputs['Metallic'].default_value    = 1.0
    bsdf.inputs['Roughness'].default_value   = 0.28
    bsdf.inputs['Anisotropic'].default_value = 0.7
    bsdf.inputs['Anisotropic Rotation'].default_value = 0.05
    bsdf.inputs['Specular IOR Level'].default_value    = 0.85

    links.new(tex_coord.outputs['Object'], mapping.inputs['Vector'])
    links.new(mapping.outputs['Vector'],   wave.inputs['Vector'])
    links.new(mapping.outputs['Vector'],   noise.inputs['Vector'])
    links.new(mapping.outputs['Vector'],   scratch_n.inputs['Vector'])
    links.new(wave.outputs['Color'],       mix_rgb.inputs[1])
    links.new(noise.outputs['Color'],      mix_rgb.inputs[2])
    links.new(mix_rgb.outputs['Color'],    ramp.inputs['Fac'])
    links.new(ramp.outputs['Color'],       bsdf.inputs['Base Color'])
    links.new(scratch_n.outputs['Fac'],    bump.inputs['Height'])
    links.new(bump.outputs['Normal'],      bsdf.inputs['Normal'])
    links.new(bsdf.outputs['BSDF'],        out.inputs['Surface'])

    out.location    = (600,  0)
    bsdf.location   = (300,  0)
    ramp.location   = (  0,  80)
    mix_rgb.location= (-250, 80)
    wave.location   = (-500, 150)
    noise.location  = (-500,-50)
    tex_coord.location = (-800, 0)
    mapping.location   = (-650, 0)
    scratch_n.location = (-500,-200)
    bump.location      = (  0,-200)
    return mat


def make_copper():
    mat = bpy.data.materials.new("MAT_Copper")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out  = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    noise= nodes.new('ShaderNodeTexNoise')
    ramp = nodes.new('ShaderNodeValToRGB')
    bump = nodes.new('ShaderNodeBump')
    tex  = nodes.new('ShaderNodeTexCoord')
    mix  = nodes.new('ShaderNodeMixRGB')

    noise.inputs['Scale'].default_value     = 60
    noise.inputs['Detail'].default_value    = 10
    noise.inputs['Roughness'].default_value = 0.55

    # Copper color ramp: polished to oxidized
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color    = (0.72, 0.32, 0.10, 1)   # polished copper
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color    = (0.54, 0.25, 0.07, 1)   # darker used copper

    bsdf.inputs['Metallic'].default_value    = 1.0
    bsdf.inputs['Roughness'].default_value   = 0.22
    bsdf.inputs['Anisotropic'].default_value = 0.5
    bsdf.inputs['Specular IOR Level'].default_value    = 0.9

    bump.inputs['Strength'].default_value = 0.05

    links.new(tex.outputs['Object'],   noise.inputs['Vector'])
    links.new(noise.outputs['Fac'],    ramp.inputs['Fac'])
    links.new(ramp.outputs['Color'],   bsdf.inputs['Base Color'])
    links.new(noise.outputs['Fac'],    bump.inputs['Height'])
    links.new(bump.outputs['Normal'],  bsdf.inputs['Normal'])
    links.new(bsdf.outputs['BSDF'],    out.inputs['Surface'])
    return mat


def make_dark_steel():
    mat = bpy.data.materials.new("MAT_DarkSteel")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out  = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    noise= nodes.new('ShaderNodeTexNoise')
    bump = nodes.new('ShaderNodeBump')
    tex  = nodes.new('ShaderNodeTexCoord')

    noise.inputs['Scale'].default_value     = 40
    noise.inputs['Detail'].default_value    = 12
    noise.inputs['Roughness'].default_value = 0.7

    bsdf.inputs['Base Color'].default_value  = (0.08, 0.08, 0.09, 1)
    bsdf.inputs['Metallic'].default_value    = 0.95
    bsdf.inputs['Roughness'].default_value   = 0.45
    bsdf.inputs['Specular IOR Level'].default_value    = 0.6

    bump.inputs['Strength'].default_value = 0.06

    links.new(tex.outputs['Object'],   noise.inputs['Vector'])
    links.new(noise.outputs['Fac'],    bump.inputs['Height'])
    links.new(bump.outputs['Normal'],  bsdf.inputs['Normal'])
    links.new(bsdf.outputs['BSDF'],    out.inputs['Surface'])
    return mat


def make_titanium():
    mat = bpy.data.materials.new("MAT_Titanium")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out  = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')

    bsdf.inputs['Base Color'].default_value  = (0.40, 0.38, 0.36, 1)
    bsdf.inputs['Metallic'].default_value    = 1.0
    bsdf.inputs['Roughness'].default_value   = 0.35
    bsdf.inputs['Specular IOR Level'].default_value    = 0.75

    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return mat


def make_frosted_glass():
    mat = bpy.data.materials.new("MAT_FrostedGlass")
    mat.use_nodes = True
    # blend_method removed in Blender 4.2+; use_transparency replaces it
    if hasattr(mat, 'blend_method'):
        mat.blend_method = 'BLEND'
    # shadow_method removed in Blender 4.x
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out  = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    noise= nodes.new('ShaderNodeTexNoise')
    bump = nodes.new('ShaderNodeBump')

    noise.inputs['Scale'].default_value     = 120
    noise.inputs['Detail'].default_value    = 10
    noise.inputs['Roughness'].default_value = 0.65

    bsdf.inputs['Base Color'].default_value      = (0.75, 0.90, 1.0, 1)
    bsdf.inputs['Metallic'].default_value        = 0.0
    bsdf.inputs['Roughness'].default_value       = 0.12
    bsdf.inputs['Transmission Weight'].default_value = 0.90
    bsdf.inputs['IOR'].default_value             = 1.47
    bsdf.inputs['Alpha'].default_value           = 0.85
    bsdf.inputs['Specular IOR Level'].default_value        = 0.5

    bump.inputs['Strength'].default_value = 0.15

    links.new(noise.outputs['Fac'],    bump.inputs['Height'])
    links.new(bump.outputs['Normal'],  bsdf.inputs['Normal'])
    links.new(bsdf.outputs['BSDF'],    out.inputs['Surface'])
    return mat


def make_arc_glow():
    """Emissive blue palladium core glow."""
    mat = bpy.data.materials.new("MAT_ArcGlow")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out   = nodes.new('ShaderNodeOutputMaterial')
    emit  = nodes.new('ShaderNodeEmission')
    noise = nodes.new('ShaderNodeTexNoise')
    math1 = nodes.new('ShaderNodeMath')
    mix   = nodes.new('ShaderNodeMixShader')
    trans = nodes.new('ShaderNodeBsdfTransparent')

    emit.inputs['Color'].default_value    = (0.05, 0.45, 1.0, 1)
    emit.inputs['Strength'].default_value = 18.0

    noise.inputs['Scale'].default_value     = 30
    noise.inputs['Detail'].default_value    = 8
    noise.inputs['Roughness'].default_value = 0.5

    math1.operation = 'MULTIPLY'
    math1.inputs[1].default_value = 0.3

    links.new(noise.outputs['Fac'],    math1.inputs[0])
    links.new(math1.outputs['Value'],  mix.inputs['Fac'])
    links.new(trans.outputs['BSDF'],   mix.inputs[1])
    links.new(emit.outputs['Emission'],mix.inputs[2])
    links.new(mix.outputs['Shader'],   out.inputs['Surface'])
    return mat


def make_glow_ring():
    """Outer blue ring emissive."""
    mat = bpy.data.materials.new("MAT_GlowRing")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out  = nodes.new('ShaderNodeOutputMaterial')
    emit = nodes.new('ShaderNodeEmission')
    emit.inputs['Color'].default_value    = (0.08, 0.55, 1.0, 1)
    emit.inputs['Strength'].default_value = 8.0
    links.new(emit.outputs['Emission'], out.inputs['Surface'])
    return mat


def make_black_rubber():
    mat = bpy.data.materials.new("MAT_BlackRubber")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out  = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value  = (0.03, 0.03, 0.03, 1)
    bsdf.inputs['Metallic'].default_value    = 0.0
    bsdf.inputs['Roughness'].default_value   = 0.9
    bsdf.inputs['Specular IOR Level'].default_value    = 0.02
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return mat


# ─────────────────────────────────────────────────
#   GEOMETRY BUILDERS
# ─────────────────────────────────────────────────

def add_outer_housing(col, mat_aluminum, mat_steel):
    """The main circular housing body — thick machined disc."""
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=128, radius=1.0)
    bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    bmesh.ops.translate(bm, vec=(0, 0, -0.14), verts=[v for v in bm.verts if v.co.z > 0.01])

    mesh = bpy.data.meshes.new("Mesh_OuterHousing")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("ARC_OuterHousing", mesh)
    link_to(obj, col)

    # Bevel modifier
    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width  = 0.015
    bev.segments = 3
    bev.limit_method = 'ANGLE'
    bev.angle_limit  = math.radians(60)

    sub = obj.modifiers.new("Subsurf", 'SUBSURF')
    sub.levels         = 2
    sub.render_levels  = 3

    obj.data.materials.append(mat_aluminum)
    set_smooth(obj)
    return obj


def add_ring(col, name, radius, width, height, z, mat, segments=128, bevel=0.008):
    """Generic torus/ring component."""
    bm = bmesh.new()
    # outer and inner profiles
    for v in bmesh.ops.create_circle(bm, cap_ends=False, segments=segments, radius=radius + width)['verts']:
        pass
    bmesh.ops.create_circle(bm, cap_ends=False, segments=segments, radius=radius)

    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    obj  = bpy.data.objects.new(name, mesh)
    link_to(obj, col)

    # Use a cylinder approach: primitive torus-like via screw modifier
    inner_obj = _make_ring_profile(col, name, radius, width, height, z, mat, segments, bevel)
    return inner_obj


def _make_ring_profile(col, name, r_inner, width, height, z, mat, segs=128, bevel=0.008):
    """Create a hollow disc ring using profile + spin."""
    bm = bmesh.new()
    # Profile: a rectangle in the XZ plane
    hw = width / 2
    hh = height / 2
    cx = r_inner + hw
    verts = [
        bm.verts.new((cx - hw, 0, -hh)),
        bm.verts.new((cx + hw, 0, -hh)),
        bm.verts.new((cx + hw, 0,  hh)),
        bm.verts.new((cx - hw, 0,  hh)),
    ]
    bm.faces.new(verts)

    # Spin around Z
    ret = bmesh.ops.spin(bm, geom=bm.faces[:] + bm.edges[:] + bm.verts[:],
                         angle=math.radians(360), steps=segs,
                         axis=(0, 0, 1), cent=(0, 0, 0))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0001)

    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    obj.location.z = z
    link_to(obj, col)

    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width    = bevel
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit  = math.radians(45)

    obj.data.materials.append(mat)
    set_smooth(obj)
    return obj


def add_turbine_blades(col, mat_titanium, count=12, z=0.04):
    """Inner turbine-like blades radiating from center."""
    blades = []
    for i in range(count):
        angle = (2 * math.pi / count) * i
        bm = bmesh.new()
        # Blade profile: trapezoidal
        verts = [
            bm.verts.new((0.08,  0.018, 0)),
            bm.verts.new((0.42,  0.008, 0)),
            bm.verts.new((0.42, -0.008, 0)),
            bm.verts.new((0.08, -0.018, 0)),
        ]
        f = bm.faces.new(verts)
        bmesh.ops.extrude_face_region(bm, geom=[f])
        top_verts = [v for v in bm.verts if v.co.z > 0.001]
        bmesh.ops.translate(bm, verts=top_verts, vec=(0, 0, 0.022))

        mesh = bpy.data.meshes.new(f"Mesh_Blade_{i}")
        bm.to_mesh(mesh)
        bm.free()

        obj = bpy.data.objects.new(f"ARC_Blade_{i:02d}", mesh)
        obj.location.z = z
        obj.rotation_euler.z = angle
        link_to(obj, col)

        bev = obj.modifiers.new("Bevel", 'BEVEL')
        bev.width    = 0.003
        bev.segments = 2

        obj.data.materials.append(mat_titanium)
        set_smooth(obj)
        blades.append(obj)
    return blades


def add_coil_segment(col, mat_copper, r, coil_r, turns, height, z=0.0, n=32, tube_segs=12):
    """Helical copper coil via curve."""
    # Create a helix path
    verts_path = []
    total_steps = turns * n
    for s in range(total_steps + 1):
        t = s / total_steps
        angle = t * turns * 2 * math.pi
        vz    = (t - 0.5) * height
        verts_path.append((
            r * math.cos(angle),
            r * math.sin(angle),
            vz + z
        ))

    curve_data = bpy.data.curves.new(f"Crv_Coil_r{int(r*100)}", 'CURVE')
    curve_data.dimensions = '3D'
    spline = curve_data.splines.new('NURBS')
    spline.points.add(len(verts_path) - 1)
    for i, pt in enumerate(verts_path):
        spline.points[i].co = (*pt, 1)
    spline.use_endpoint_u = True

    curve_data.bevel_depth    = coil_r
    curve_data.bevel_resolution = tube_segs
    curve_data.use_fill_caps = True

    obj = bpy.data.objects.new(f"ARC_Coil_r{int(r*100)}", curve_data)
    link_to(obj, col)
    obj.data.materials.append(mat_copper)
    return obj


def add_coil_set(col, mat_copper):
    """Three concentric coil rings — the electromagnetic coils."""
    coils = []
    specs = [
        # radius, coil_r, turns, height, z
        (0.52, 0.010, 3, 0.065, 0.055),
        (0.64, 0.008, 4, 0.060, 0.050),
        (0.76, 0.007, 3, 0.055, 0.045),
    ]
    for spec in specs:
        c = add_coil_segment(col, mat_copper, *spec)
        coils.append(c)
    return coils


def add_bolt_ring(col, mat_steel, count=8, radius=0.88, z=0.07):
    """Circle of hex bolts around the housing."""
    bolts = []
    for i in range(count):
        angle = (2 * math.pi / count) * i + (math.pi / count)
        bm = bmesh.new()
        bmesh.ops.create_circle(bm, cap_ends=True, segments=6, radius=0.022)
        bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
        top_v = [v for v in bm.verts if v.co.z > 0.001]
        bmesh.ops.translate(bm, verts=top_v, vec=(0, 0, 0.018))
        # Add bolt head flat on top
        bmesh.ops.create_circle(bm, cap_ends=True, segments=6, radius=0.016)

        mesh = bpy.data.meshes.new(f"Mesh_Bolt_{i}")
        bm.to_mesh(mesh)
        bm.free()

        obj = bpy.data.objects.new(f"ARC_Bolt_{i:02d}", mesh)
        px = radius * math.cos(angle)
        py = radius * math.sin(angle)
        obj.location = (px, py, z)
        link_to(obj, col)
        obj.data.materials.append(mat_steel)
        set_smooth(obj, 10)
        bolts.append(obj)
    return bolts


def add_inner_disc(col, mat_glass, mat_glow):
    """Central glowing disc — palladium core (frosted glass over emissive)."""
    # Emissive inner
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=128, radius=0.075)
    bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    top_v = [v for v in bm.verts if v.co.z > 0.001]
    bmesh.ops.translate(bm, verts=top_v, vec=(0, 0, 0.012))
    mesh = bpy.data.meshes.new("Mesh_CoreGlow")
    bm.to_mesh(mesh)
    bm.free()
    core = bpy.data.objects.new("ARC_CoreGlow", mesh)
    link_to(col, core) if hasattr(col, 'objects') else col.objects.link(core)
    core.data.materials.append(mat_glow)
    set_smooth(core)

    # Glass lens on top
    bm2 = bmesh.new()
    bmesh.ops.create_circle(bm2, cap_ends=True, segments=128, radius=0.072)
    bmesh.ops.extrude_face_region(bm2, geom=bm2.faces[:])
    top_v2 = [v for v in bm2.verts if v.co.z > 0.001]
    bmesh.ops.translate(bm2, verts=top_v2, vec=(0, 0, 0.006))
    mesh2 = bpy.data.meshes.new("Mesh_CoreGlass")
    bm2.to_mesh(mesh2)
    bm2.free()
    lens = bpy.data.objects.new("ARC_CoreGlass", mesh2)
    lens.location.z = 0.012
    link_to(col, lens) if hasattr(col, 'objects') else col.objects.link(lens)
    lens.data.materials.append(mat_glass)
    set_smooth(lens)

    return core, lens


def add_triangular_brackets(col, mat_titanium, count=3, z=0.025):
    """Three structural mounting brackets on the inner ring."""
    brackets = []
    for i in range(count):
        angle = (2 * math.pi / count) * i + math.pi / 6
        bm = bmesh.new()
        verts = [
            bm.verts.new((0.12,  0.015, 0)),
            bm.verts.new((0.46,  0.028, 0)),
            bm.verts.new((0.46, -0.028, 0)),
            bm.verts.new((0.12, -0.015, 0)),
        ]
        f = bm.faces.new(verts)
        bmesh.ops.extrude_face_region(bm, geom=[f])
        top_v = [v for v in bm.verts if v.co.z > 0.001]
        bmesh.ops.translate(bm, verts=top_v, vec=(0, 0, 0.014))

        mesh = bpy.data.meshes.new(f"Mesh_Bracket_{i}")
        bm.to_mesh(mesh)
        bm.free()

        obj = bpy.data.objects.new(f"ARC_Bracket_{i:02d}", mesh)
        obj.location.z = z
        obj.rotation_euler.z = angle
        link_to(obj, col)

        bev = obj.modifiers.new("Bevel", 'BEVEL')
        bev.width    = 0.003
        bev.segments = 2
        obj.data.materials.append(mat_titanium)
        set_smooth(obj)
        brackets.append(obj)
    return brackets


def add_vent_holes(col, mat_steel, count=24, radius=0.36, z=0.07):
    """Small cylindrical vents on the mid-ring."""
    vents = []
    for i in range(count):
        angle = (2 * math.pi / count) * i
        bm = bmesh.new()
        bmesh.ops.create_circle(bm, cap_ends=True, segments=12, radius=0.013)
        bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
        top_v = [v for v in bm.verts if v.co.z > 0.001]
        bmesh.ops.translate(bm, verts=top_v, vec=(0, 0, -0.02))

        mesh = bpy.data.meshes.new(f"Mesh_Vent_{i}")
        bm.to_mesh(mesh)
        bm.free()

        obj = bpy.data.objects.new(f"ARC_Vent_{i:02d}", mesh)
        px = radius * math.cos(angle)
        py = radius * math.sin(angle)
        obj.location = (px, py, z)
        link_to(obj, col)
        obj.data.materials.append(mat_steel)
        set_smooth(obj, 15)
        vents.append(obj)
    return vents


def add_glow_ring_strip(col, mat_glow_ring, z=0.06):
    """Thin emissive ring between coils and housing."""
    bm = bmesh.new()
    segs = 256
    r_in  = 0.92
    r_out = 0.96
    hw = (r_out - r_in) / 2
    cx = r_in + hw

    verts = [
        bm.verts.new((cx - hw, 0, -0.003)),
        bm.verts.new((cx + hw, 0, -0.003)),
        bm.verts.new((cx + hw, 0,  0.003)),
        bm.verts.new((cx - hw, 0,  0.003)),
    ]
    f = bm.faces.new(verts)
    bmesh.ops.spin(bm, geom=bm.faces[:] + bm.edges[:] + bm.verts[:],
                   angle=math.radians(360), steps=segs,
                   axis=(0, 0, 1), cent=(0, 0, 0))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0001)

    mesh = bpy.data.meshes.new("Mesh_GlowStrip")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("ARC_GlowStrip", mesh)
    obj.location.z = z
    link_to(obj, col)
    obj.data.materials.append(mat_glow_ring)
    set_smooth(obj)
    return obj


def add_cable_bundle(col, mat_rubber, mat_copper, r=0.80, z=0.0):
    """A small bundle of cables running along the bottom."""
    cables = []
    offsets = [(-0.012, 0), (0, -0.012), (0.012, 0), (0, 0.012)]
    for idx, (ox, oy) in enumerate(offsets):
        curve_data = bpy.data.curves.new(f"Crv_Cable_{idx}", 'CURVE')
        curve_data.dimensions = '3D'
        spline = curve_data.splines.new('NURBS')
        pts = [
            (r + ox, oy, -0.04 + z),
            (r * 0.7 + ox, oy * 0.5, -0.02 + z),
            (r * 0.3 + ox * 0.3, oy * 0.2, 0.01 + z),
        ]
        spline.points.add(len(pts) - 1)
        for i, pt in enumerate(pts):
            spline.points[i].co = (*pt, 1)
        spline.use_endpoint_u = True
        curve_data.bevel_depth    = 0.007
        curve_data.bevel_resolution = 8
        curve_data.use_fill_caps   = True

        obj = bpy.data.objects.new(f"ARC_Cable_{idx:02d}", curve_data)
        link_to(obj, col)
        mat = mat_rubber if idx % 2 == 0 else mat_copper
        obj.data.materials.append(mat)
        cables.append(obj)
    return cables


def add_outer_lip(col, mat_aluminum):
    """Thick beveled outer rim lip."""
    bm = bmesh.new()
    verts = [
        bm.verts.new((0.965, 0, -0.068)),
        bm.verts.new((1.010, 0, -0.068)),
        bm.verts.new((1.010, 0,  0.082)),
        bm.verts.new((0.965, 0,  0.082)),
    ]
    f = bm.faces.new(verts)
    bmesh.ops.spin(bm, geom=bm.faces[:] + bm.edges[:] + bm.verts[:],
                   angle=math.radians(360), steps=256,
                   axis=(0, 0, 1), cent=(0, 0, 0))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0001)

    mesh = bpy.data.meshes.new("Mesh_OuterLip")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("ARC_OuterLip", mesh)
    link_to(obj, col)

    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width    = 0.012
    bev.segments = 3
    bev.limit_method = 'ANGLE'
    bev.angle_limit  = math.radians(60)

    obj.data.materials.append(mat_aluminum)
    set_smooth(obj)
    return obj


# ─────────────────────────────────────────────────
#   CAMERA SETUP
# ─────────────────────────────────────────────────

def setup_camera(col):
    cam_data = bpy.data.cameras.new("CAM_HeroShot")
    cam_data.lens           = 85
    cam_data.dof.use_dof    = True
    cam_data.dof.focus_distance = 1.6
    cam_data.dof.aperture_fstop = 2.8
    cam_data.clip_start     = 0.01
    cam_data.clip_end       = 100

    cam_obj = bpy.data.objects.new("CAM_HeroShot", cam_data)
    cam_obj.location        = (0.0, -1.65, 0.90)
    cam_obj.rotation_euler  = (math.radians(56), 0, 0)
    link_to(cam_obj, col)

    bpy.context.scene.camera = cam_obj
    return cam_obj


# ─────────────────────────────────────────────────
#   LIGHTING
# ─────────────────────────────────────────────────

def setup_lighting(col):
    # Key light — cold blue rim from above
    key_data = bpy.data.lights.new("LIGHT_Key", 'AREA')
    key_data.energy = 180
    key_data.color  = (0.6, 0.8, 1.0)
    key_data.size   = 0.6
    key_obj = bpy.data.objects.new("LIGHT_Key", key_data)
    key_obj.location       = (0.8, -1.2, 1.8)
    key_obj.rotation_euler = (math.radians(45), 0, math.radians(30))
    link_to(key_obj, col)

    # Fill light — very dim warm
    fill_data = bpy.data.lights.new("LIGHT_Fill", 'AREA')
    fill_data.energy = 25
    fill_data.color  = (1.0, 0.85, 0.70)
    fill_data.size   = 1.2
    fill_obj = bpy.data.objects.new("LIGHT_Fill", fill_data)
    fill_obj.location       = (-1.5, 0.5, 0.5)
    fill_obj.rotation_euler = (math.radians(20), 0, math.radians(-60))
    link_to(fill_obj, col)

    # Underlighting — cold bounce from floor
    under_data = bpy.data.lights.new("LIGHT_Under", 'AREA')
    under_data.energy = 40
    under_data.color  = (0.3, 0.65, 1.0)
    under_data.size   = 0.8
    under_obj = bpy.data.objects.new("LIGHT_Under", under_data)
    under_obj.location       = (0, 0, -0.8)
    under_obj.rotation_euler = (math.radians(180), 0, 0)
    link_to(under_obj, col)

    # Rim backlight
    rim_data = bpy.data.lights.new("LIGHT_Rim", 'SPOT')
    rim_data.energy   = 300
    rim_data.color    = (0.4, 0.75, 1.0)
    rim_data.spot_size = math.radians(45)
    rim_data.spot_blend = 0.3
    rim_obj = bpy.data.objects.new("LIGHT_Rim", rim_data)
    rim_obj.location       = (0.5, 1.6, 1.2)
    rim_obj.rotation_euler = (math.radians(-40), 0, math.radians(180))
    link_to(rim_obj, col)

    return [key_obj, fill_obj, under_obj, rim_obj]


def setup_world():
    world = bpy.data.worlds.new("World_ArcReactor")
    bpy.context.scene.world = world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links
    nodes.clear()

    out   = nodes.new('ShaderNodeOutputWorld')
    bg    = nodes.new('ShaderNodeBackground')
    env   = nodes.new('ShaderNodeTexEnvironment')
    grad  = nodes.new('ShaderNodeTexGradient')
    coord = nodes.new('ShaderNodeTexCoord')
    mix   = nodes.new('ShaderNodeMixShader')
    ramp  = nodes.new('ShaderNodeValToRGB')

    # Dark workshop gradient
    bg.inputs['Strength'].default_value = 0.08
    bg.inputs['Color'].default_value    = (0.02, 0.04, 0.06, 1)

    ramp.color_ramp.elements[0].color = (0.01, 0.02, 0.05, 1)
    ramp.color_ramp.elements[1].color = (0.05, 0.08, 0.12, 1)

    links.new(coord.outputs['Generated'], grad.inputs['Vector'])
    links.new(grad.outputs['Color'],      ramp.inputs['Fac'])
    links.new(ramp.outputs['Color'],      bg.inputs['Color'])
    links.new(bg.outputs['Background'],   out.inputs['Surface'])


# ─────────────────────────────────────────────────
#   RENDER SETTINGS
# ─────────────────────────────────────────────────

def setup_render():
    scene = bpy.context.scene
    scene.render.engine       = 'CYCLES'
    scene.cycles.device       = 'GPU'      # falls back to CPU if no GPU
    scene.cycles.samples      = 512
    scene.cycles.use_denoising = True
    scene.cycles.denoiser     = 'OPENIMAGEDENOISE'

    # 4K resolution
    scene.render.resolution_x = 3840
    scene.render.resolution_y = 2160
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_depth = '16'
    scene.render.filepath = r'C:\Users\AREEB\Desktop\Experimental Projects\PyBlender\arc_reactor_render.png'

    # Bloom / Glare via compositing
    scene.use_nodes = True
    comp_nodes = scene.node_tree.nodes
    comp_links = scene.node_tree.links
    comp_nodes.clear()

    render_out  = comp_nodes.new('CompositorNodeRLayers')
    comp_out    = comp_nodes.new('CompositorNodeComposite')
    viewer      = comp_nodes.new('CompositorNodeViewer')
    glare       = comp_nodes.new('CompositorNodeGlare')
    lens_dist   = comp_nodes.new('CompositorNodeLensdist')
    color_bal   = comp_nodes.new('CompositorNodeColorBalance')

    glare.glare_type = 'BLOOM'
    glare.threshold  = 0.85
    glare.size       = 7
    glare.quality    = 'HIGH'
    glare.mix        = 0.3

    lens_dist.inputs['Dispersion'].default_value = 0.012
    lens_dist.inputs['Distortion'].default_value = -0.02

    # Cinematic color grade
    color_bal.correction_method = 'LIFT_GAMMA_GAIN'
    color_bal.lift  = (0.96, 0.97, 1.04)
    color_bal.gamma = (0.98, 0.99, 1.02)
    color_bal.gain  = (0.95, 0.97, 1.05)

    comp_links.new(render_out.outputs['Image'], glare.inputs['Image'])
    comp_links.new(glare.outputs['Image'],       lens_dist.inputs['Image'])
    comp_links.new(lens_dist.outputs['Image'],   color_bal.inputs['Image'])
    comp_links.new(color_bal.outputs['Image'],   comp_out.inputs['Image'])
    comp_links.new(color_bal.outputs['Image'],   viewer.inputs['Image'])


# ─────────────────────────────────────────────────
#   ANIMATION
# ─────────────────────────────────────────────────

def setup_animation(inner_group_objects, frame_end=240):
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end   = frame_end

    for obj in inner_group_objects:
        obj.keyframe_insert('rotation_euler', frame=1)
        obj.rotation_euler.z += math.radians(360)
        obj.keyframe_insert('rotation_euler', frame=frame_end)

        # Set linear interpolation for smooth infinite rotation
        if obj.animation_data and obj.animation_data.action:
            for fcurve in obj.animation_data.action.fcurves:
                for kp in fcurve.keyframe_points:
                    kp.interpolation = 'LINEAR'


# ─────────────────────────────────────────────────
#   ASSEMBLY LINK HELPERS
# ─────────────────────────────────────────────────

def safe_link(obj, col):
    """Link object to collection safely."""
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col.objects.link(obj)


# ─────────────────────────────────────────────────
#   MAIN BUILD
# ─────────────────────────────────────────────────

def build_arc_reactor():
    print("=" * 60)
    print("  ARC REACTOR — BUILD START")
    print("=" * 60)

    clear_scene()

    # ── Collections ──────────────────────────────
    col_root     = new_collection("ARC_REACTOR")
    col_housing  = new_collection("Housing",       col_root)
    col_rings    = new_collection("Rings",         col_root)
    col_coils    = new_collection("Coils",         col_root)
    col_turbine  = new_collection("Turbine",       col_root)
    col_core     = new_collection("Core",          col_root)
    col_details  = new_collection("Details",       col_root)
    col_cables   = new_collection("Cables",        col_root)
    col_lighting = new_collection("Lighting",      col_root)
    col_camera   = new_collection("Camera",        col_root)

    # ── Materials ─────────────────────────────────
    print("  Building materials...")
    mat_aluminum  = make_brushed_aluminum()
    mat_copper    = make_copper()
    mat_steel     = make_dark_steel()
    mat_titanium  = make_titanium()
    mat_glass     = make_frosted_glass()
    mat_glow      = make_arc_glow()
    mat_glow_ring = make_glow_ring()
    mat_rubber    = make_black_rubber()

    # ── Housing / Outer Rim ───────────────────────
    print("  Building housing...")
    outer_lip = add_outer_lip(col_housing, mat_aluminum)

    # Back plate (solid disc)
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=128, radius=0.965)
    bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    back_v = [v for v in bm.verts if v.co.z > 0.001]
    bmesh.ops.translate(bm, verts=back_v, vec=(0, 0, -0.012))
    bm.verts.ensure_lookup_table()
    mesh = bpy.data.meshes.new("Mesh_BackPlate")
    bm.to_mesh(mesh)
    bm.free()
    back_plate = bpy.data.objects.new("ARC_BackPlate", mesh)
    back_plate.location.z = -0.068
    safe_link(back_plate, col_housing)
    back_plate.data.materials.append(mat_steel)
    set_smooth(back_plate)

    # ── Concentric Rings ──────────────────────────
    print("  Building concentric rings...")
    ring_specs = [
        # name, r_inner, width, height, z, mat
        ("Ring_Outer",    0.86, 0.10, 0.120, 0.00, mat_aluminum),
        ("Ring_Mid1",     0.72, 0.06, 0.100, 0.008, mat_steel),
        ("Ring_Mid2",     0.60, 0.05, 0.090, 0.015, mat_aluminum),
        ("Ring_Inner",    0.48, 0.06, 0.080, 0.020, mat_titanium),
        ("Ring_Core",     0.10, 0.06, 0.060, 0.025, mat_steel),
    ]
    rings = []
    for name, ri, w, h, z, mat in ring_specs:
        r = _make_ring_profile(col_rings, name, ri, w, h, z, mat)
        rings.append(r)

    # ── Copper Coils ──────────────────────────────
    print("  Building electromagnetic coils...")
    coils = add_coil_set(col_coils, mat_copper)

    # ── Turbine / Blades ──────────────────────────
    print("  Building turbine blades...")
    blades = add_turbine_blades(col_turbine, mat_titanium, count=12, z=0.03)

    # ── Triangular Brackets ───────────────────────
    brackets = add_triangular_brackets(col_details, mat_titanium, count=3, z=0.02)

    # ── Bolt Ring ─────────────────────────────────
    print("  Adding bolt ring...")
    bolts = add_bolt_ring(col_details, mat_steel, count=12, radius=0.92, z=0.075)

    # ── Vent Holes ────────────────────────────────
    vents = add_vent_holes(col_details, mat_steel, count=18, radius=0.38, z=0.06)

    # ── Glow Strip ────────────────────────────────
    glow_strip = add_glow_ring_strip(col_core, mat_glow_ring, z=0.055)

    # ── Core Glow Disc ────────────────────────────
    print("  Building core glow...")
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=128, radius=0.075)
    bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    core_top_v = [v for v in bm.verts if v.co.z > 0.001]
    bmesh.ops.translate(bm, verts=core_top_v, vec=(0, 0, 0.010))
    mesh = bpy.data.meshes.new("Mesh_CoreGlow")
    bm.to_mesh(mesh)
    bm.free()
    core_glow = bpy.data.objects.new("ARC_CoreGlow", mesh)
    core_glow.location.z = 0.028
    safe_link(core_glow, col_core)
    core_glow.data.materials.append(mat_glow)
    set_smooth(core_glow)

    # Glass lens
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=128, radius=0.071)
    bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    lens_top_v = [v for v in bm.verts if v.co.z > 0.001]
    bmesh.ops.translate(bm, verts=lens_top_v, vec=(0, 0, 0.007))
    mesh = bpy.data.meshes.new("Mesh_CoreLens")
    bm.to_mesh(mesh)
    bm.free()
    core_lens = bpy.data.objects.new("ARC_CoreLens", mesh)
    core_lens.location.z = 0.038
    safe_link(core_lens, col_core)
    core_lens.data.materials.append(mat_glass)
    set_smooth(core_lens)

    # ── Cables ────────────────────────────────────
    print("  Adding cable bundle...")
    cables = add_cable_bundle(col_cables, mat_rubber, mat_copper)

    # ── Camera ────────────────────────────────────
    print("  Setting up camera...")
    cam = setup_camera(col_camera)
    bpy.context.scene.camera = cam

    # ── Lighting ──────────────────────────────────
    print("  Setting up lighting rig...")
    lights = setup_lighting(col_lighting)
    setup_world()

    # ── Render ────────────────────────────────────
    print("  Configuring render...")
    setup_render()

    # ── Animation — rotate turbine blades ─────────
    print("  Setting up animation...")
    setup_animation(blades + coils, frame_end=240)

    # ── Final scene frame ─────────────────────────
    bpy.context.scene.frame_set(1)
    deselect_all()

    # ── Save the scene ────────────────────────────
    output_path = r"C:\Users\AREEB\Desktop\Experimental Projects\PyBlender\arc_reactor.blend"
    bpy.ops.wm.save_as_mainfile(filepath=output_path)
    print(f"  Scene saved → {output_path}")

    # ── Summary ───────────────────────────────────
    total_objects = len(list(bpy.data.objects))
    total_polys   = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
    print("\n" + "=" * 60)
    print(f"  BUILD COMPLETE")
    print(f"  Objects   : {total_objects}")
    print(f"  Polygons  : {total_polys:,} (pre-subdivision)")
    print(f"  Materials : {len(bpy.data.materials)}")
    print(f"  Renderer  : Cycles | 4K | 512 samples")
    print("=" * 60)
    print("\n  RENDER: Render > Render Image  (F12)")
    print("  ANIMATE: Render > Render Animation")
    print("  Output → arc_reactor_render.png\n")


# ─────────────────────────────────────────────────
#   ENTRY POINT
# ─────────────────────────────────────────────────

if __name__ == "__main__":
    build_arc_reactor()