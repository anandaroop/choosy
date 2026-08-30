import { ApiError, SubmissionPayload, SubmissionResponse } from "labeling/types"

export async function submitTask(
  payload: SubmissionPayload
): Promise<SubmissionResponse> {
  const response = await fetch("/api/labeling/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const { error } = (await response.json()) as ApiError
    throw new Error(error)
  }

  return (await response.json()) as SubmissionResponse
}
