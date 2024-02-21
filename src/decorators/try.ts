// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const Try = (originalMethod: any, context: ClassMethodDecoratorContext) => {
  const original = originalMethod.descriptor.value;
  const methodName = context.name.toString();

  originalMethod.descriptor.value = async function (...args: []) {
    try {
      return await original.apply(this, args);
    } catch (error) {
      console.error(`Error in ${methodName}: ${(error as Error).message}`);
      return null;
    }
  };
};
