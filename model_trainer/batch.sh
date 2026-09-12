#!/bin/bash
next_available_path() {
    local path="$1"
    local candidate="$path"
    local counter=1

    while [ -e "$candidate" ]; do
        candidate="${path%.*}_${counter}.${path##*.}"
        counter=$((counter + 1))
    done

    echo "$candidate"
}

for f in processed/*.{jpg,jpeg,png,JPG,PNG}; do
    [ -e "$f" ] || continue
    echo "Processing $f..."
    filename="${f##*/}"
    filename="${filename%.*}"
    ext="${f##*.}"
    
    # 1. Tilt Top
    output=$(next_available_path "processed/${filename}_top.${ext}")
    magick "$f" -virtual-pixel transparent -distort Perspective "0,0 140,250  650,0 510,250  650,774 650,774  0,774 0,774" "$output"
    
    # 2. Tilt Bottom
    output=$(next_available_path "processed/${filename}_bottom.${ext}")
    magick "$f" -virtual-pixel transparent -distort Perspective "0,0 0,0  650,0 650,0  650,774 510,524  0,774 140,524" "$output"
    
    # 3. Tilt Left
    output=$(next_available_path "processed/${filename}_left.${ext}")
    magick "$f" -virtual-pixel transparent -distort Perspective "0,0 200,120  650,0 650,0  650,774 650,774  0,774 200,654" "$output"
    
    # 4. Tilt Right
    output=$(next_available_path "processed/${filename}_right.${ext}")
    magick "$f" -virtual-pixel transparent -distort Perspective "0,0 0,0  650,0 450,120  650,774 450,654  0,774 0,774" "$output"
done
echo "All 4-way 3D perspectives generated!"
