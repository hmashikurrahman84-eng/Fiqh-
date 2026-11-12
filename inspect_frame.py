from PIL import Image

im = Image.open("public/assets/aistudio/IMG-20261112-WA0041_26a5984f.jpg")
width, height = im.size
print(f"Image Size: {width}x{height}")

# Find the blue frame
# The frame has a cyan/blue border or distinct color.
# Let us inspect the region x: 180..500, y: 540..850
pixels = im.load()

# Let us find where the blue border starts
# Sample a grid in the lower left to find the box edges
matching_coords = []
for y in range(540, 850):
    for x in range(180, 500):
        r, g, b = pixels[x, y][:3]
        # Check for the border color of the frame:
        # Looking at the image, there is a cyan/blue line around the Canva frame
        # or the green grass / cloud of the Canva placeholder:
        # Green grass: g > 120 and r < 140, or cloud: r,g,b > 240, or sky: r < 210, g > 220, b > 240
        # Cyan border: b > 180 and g > 150 and r < 100
        if b > 160 and g > 140 and r < 90:
            matching_coords.append((x, y, r, g, b))

print(f"Found {len(matching_coords)} border-like pixels")
if matching_coords:
    min_x = min(c[0] for c in matching_coords)
    max_x = max(c[0] for c in matching_coords)
    min_y = min(c[1] for c in matching_coords)
    max_y = max(c[1] for c in matching_coords)
    print(f"Border bbox: x={min_x}, y={min_y}, w={max_x - min_x}, h={max_y - min_y}")
    # Sample color
    print(f"Sample border color: RGB{matching_coords[0][2:]}")

# Also let's inspect the exact Canva placeholder rectangle:
# The background of the poster outside is pale light-blue texture (r ~ 200..230, g ~ 230..250, b ~ 255)
# Inside the Canva frame:
# Top part is sky (r ~ 190..230, g ~ 230..250, b ~ 255)
# Bottom part is green grass (r ~ 150..180, g ~ 180..205, b ~ 50..80)
grass_coords = []
for y in range(540, 850):
    for x in range(180, 500):
        r, g, b = pixels[x, y][:3]
        if g > 140 and b < 100 and r > 100:
            grass_coords.append((x, y))

if grass_coords:
    min_gx = min(c[0] for c in grass_coords)
    max_gx = max(c[0] for c in grass_coords)
    min_gy = min(c[1] for c in grass_coords)
    max_gy = max(c[1] for c in grass_coords)
    print(f"Grass bbox: x from {min_gx} to {max_gx}, y from {min_gy} to {max_gy}")
