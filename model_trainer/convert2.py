import tensorflow as tf

saved_model_dir = "./luisterschelppack"
converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_dir)

# Enable Select TF ops alongside standard TFLite ops
converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS  # Use standard TFLite ops first
]

tflite_model = converter.convert()

with open("model_with_custom_ops.tflite", "wb") as f:
    f.write(tflite_model)