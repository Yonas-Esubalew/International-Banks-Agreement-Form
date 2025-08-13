export function prismaErrorToResponse(err) {

    if (err.code === "P2002") {
    return { status: 409, body: { success: false, message: "❌ Duplicate value violates unique constraint" } };
  }
  if (err.code === "P2025") {
    return { status: 404, body: { success: false, message: "❌ Record not found" } };
  }
  return { status: 500, body: { success: false, message: err.message || "❌ Internal server error" } };
  
}
