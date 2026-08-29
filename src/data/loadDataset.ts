import { Dataset } from "labeling/types"

import comps from "./comps-v1.json"

/**
 * The active labeling dataset, resolved at build time — no runtime fetch.
 * Swap the import (and re-export) here when a new dataset version ships.
 */
const dataset: Dataset = comps

export default dataset
