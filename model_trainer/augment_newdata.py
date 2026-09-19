from pathlib import Path

from PIL import Image, ImageEnhance


SOURCE_DIR = Path(__file__).resolve().parent / "newdata"
OUTPUT_DIR = Path(__file__).resolve().parent / "generated_from_newdata"
VALIDATION_DIR = Path(__file__).resolve().parent / "validation_from_newdata"
NEWEST_SOURCE_DIR = Path(__file__).resolve().parent / "newestdata"
NEWEST_OUTPUT_DIR = Path(__file__).resolve().parent / "generated_from_newestdata"
IMAGE_SIZE = (256, 256)
HOLDOUTS_PER_CLASS = 1


def transform_image(image, name):
    if name == "original":
        return image
    if name.startswith("rotate"):
        angle = float(name.removeprefix("rotate"))
        return image.rotate(angle, resample=Image.Resampling.BICUBIC, fillcolor=255)
    if name.startswith("shift"):
        x_shift, y_shift = map(int, name.removeprefix("shift").split("x"))
        shifted = Image.new("L", IMAGE_SIZE, 255)
        shifted.paste(image, (x_shift, y_shift))
        return shifted
    if name.startswith("zoom"):
        scale = float(name.removeprefix("zoom"))
        width = round(IMAGE_SIZE[0] * scale)
        height = round(IMAGE_SIZE[1] * scale)
        resized = image.resize((width, height), Image.Resampling.BICUBIC)
        if scale >= 1:
            left = (width - IMAGE_SIZE[0]) // 2
            top = (height - IMAGE_SIZE[1]) // 2
            return resized.crop((left, top, left + IMAGE_SIZE[0], top + IMAGE_SIZE[1]))
        canvas = Image.new("L", IMAGE_SIZE, 255)
        left = (IMAGE_SIZE[0] - width) // 2
        top = (IMAGE_SIZE[1] - height) // 2
        canvas.paste(resized, (left, top))
        return canvas
    if name == "contrast_low":
        return ImageEnhance.Contrast(image).enhance(0.85)
    if name == "contrast_high":
        return ImageEnhance.Contrast(image).enhance(1.15)
    raise ValueError(f"Unknown transform: {name}")


def generate_training_images(source_paths, output_dir, transforms):
    output_dir.mkdir(exist_ok=True)
    for old_path in output_dir.glob("*.png"):
        old_path.unlink()

    for source_path in source_paths:
        image = Image.open(source_path).convert("L").resize(IMAGE_SIZE, Image.Resampling.LANCZOS)
        stem = source_path.stem
        for transform_name in transforms:
            output = transform_image(image, transform_name)
            output.save(output_dir / f"{stem}_{transform_name}.png")

    return len(source_paths) * len(transforms)


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    VALIDATION_DIR.mkdir(exist_ok=True)
    transforms = (
        "original",
        "rotate-8",
        "rotate8",
        "shift-8x0",
        "shift8x0",
        "shift0x-8",
        "shift0x8",
        "zoom0.9",
        "zoom1.1"
    )

    source_paths = sorted(SOURCE_DIR.glob("*.png"))
    if not source_paths:
        raise RuntimeError(f"No PNG files found in {SOURCE_DIR}")

    by_class = {}
    for source_path in source_paths:
        by_class.setdefault(source_path.name[0].lower(), []).append(source_path)

    training_paths = []
    validation_paths = []
    for class_paths in by_class.values():
        if len(class_paths) <= HOLDOUTS_PER_CLASS:
            raise RuntimeError("Each class needs more images than its holdout count")
        training_paths.extend(class_paths[:-HOLDOUTS_PER_CLASS])
        validation_paths.extend(class_paths[-HOLDOUTS_PER_CLASS:])

    for old_path in VALIDATION_DIR.glob("*.png"):
        old_path.unlink()

    for source_path in validation_paths:
        image = Image.open(source_path).convert("L").resize(IMAGE_SIZE, Image.Resampling.LANCZOS)
        image.save(VALIDATION_DIR / source_path.name)

    generated_count = generate_training_images(training_paths, OUTPUT_DIR, transforms)

    newest_paths = sorted(NEWEST_SOURCE_DIR.glob("*.png"))
    if not newest_paths:
        raise RuntimeError(f"No PNG files found in {NEWEST_SOURCE_DIR}")
    newest_generated_count = generate_training_images(
        newest_paths,
        NEWEST_OUTPUT_DIR,
        transforms,
    )

    print(f"Generated {generated_count} training images in {OUTPUT_DIR}")
    print(f"Generated {newest_generated_count} training images in {NEWEST_OUTPUT_DIR}")
    print(f"Reserved {len(validation_paths)} validation images in {VALIDATION_DIR}")


if __name__ == "__main__":
    main()
