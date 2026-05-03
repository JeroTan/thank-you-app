export type CanvasAssetSource<TKey extends string = string> = {
  key: TKey;
  src: string;
};

export type CanvasAssetRegistry<TKey extends string = string> = Record<TKey, HTMLImageElement>;

async function decodeLoadedImage(image: HTMLImageElement): Promise<void> {
  if (typeof image.decode !== "function") {
    return;
  }

  try {
    await image.decode();
  } catch {
    return;
  }
}

export async function loadCanvasImageAsset(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const image = new Image();

    image.decoding = "async";
    image.onload = async () => {
      await decodeLoadedImage(image);
      resolve(image);
    };
    image.onerror = () => {
      reject(new Error(`Failed to load image asset: ${src}`));
    };
    image.src = src;
  });
}

export async function loadCanvasImageAssets<TKey extends string>(
  sources: ReadonlyArray<CanvasAssetSource<TKey>>
): Promise<CanvasAssetRegistry<TKey>> {
  const entries = await Promise.all(
    sources.map(async ({ key, src }) => [key, await loadCanvasImageAsset(src)] as const)
  );

  return Object.fromEntries(entries) as CanvasAssetRegistry<TKey>;
}
