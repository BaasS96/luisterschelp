from pathlib import Path

import tensorflow as tf


tf.config.set_visible_devices([], "GPU")

BASE_DIR = Path(__file__).resolve().parent
keras_model = tf.keras.models.load_model(BASE_DIR / "luisterschelp4.keras")


@tf.function
def predict(inputs):
	return keras_model(inputs, training=False)


concrete_predict = predict.get_concrete_function(
	tf.TensorSpec([None, 256, 256, 1], tf.float32),
)
converter = tf.lite.TFLiteConverter.from_concrete_functions(
	[concrete_predict],
	keras_model,
)
tflite_model = converter.convert()
(BASE_DIR / "luisterschelp4.tflite").write_bytes(tflite_model)