from pathlib import Path
import sys
from types import ModuleType

# tensorflowjs imports this optional converter dependency even for ordinary
# TensorFlow graphs. This model does not contain TFDF operators.
sys.modules.setdefault("tensorflow_decision_forests", ModuleType("tensorflow_decision_forests"))

import tensorflowjs as tfjs


MODEL_DIR = Path(__file__).resolve().parent / "luisterschelp3_saved_model"

tfjs.converters.convert_tf_saved_model(
    str(MODEL_DIR),
    str(MODEL_DIR),
    signature_def="serving_default",
)