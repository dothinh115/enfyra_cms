export default defineNuxtRouteMiddleware(async (to, from) => {
  const { me, fetchUser } = useAuth();

  if (!me.value) {
    await fetchUser();
  }

  // Nếu chưa có user → gọi fetchUser
  if (to.path !== "/login") {
    if (!me.value) {
      return navigateTo("/login");
    }
  }

  if (to.path === "/login" && me.value) {
    return navigateTo("/");
  }
});
