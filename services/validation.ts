export const isValidEmail = (email: string) =>
  /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

export const isValidPassword = (pw: string) =>
  /^(?=.*[0-9])(?=.*[^\w\s]).{5,}$/.test(pw); // >=5, includes number & special
