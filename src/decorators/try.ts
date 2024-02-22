export function Try(
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  originalMethod: Function,
  context: ClassMethodDecoratorContext,
) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async function replacementMethod(this: any, ...args: any) {
    try {
      return await originalMethod.call(this, ...args);
    } catch (error) {
      console.error(error);

      return null;
    }
  }

  return replacementMethod;
}
