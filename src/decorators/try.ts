export function Try(
  // biome-ignore lint/complexity/noBannedTypes: When typing decorators this doesn't really matter hassle
  originalMethod: Function,
  context: ClassMethodDecoratorContext,
) {
  // biome-ignore lint/suspicious/noExplicitAny: When typing decorators this doesn't really matter hassle
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
