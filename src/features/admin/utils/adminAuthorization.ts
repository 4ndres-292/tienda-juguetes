export function isAllowedAdmin(userId: string | undefined, allowedId: string | undefined) {
  return Boolean(userId && allowedId && userId === allowedId);
}

export function assertAllowedAdmin(userId: string | undefined, allowedId: string | undefined) {
  if (!isAllowedAdmin(userId, allowedId)) {
    throw new Error("Administrator authorization required");
  }
}
