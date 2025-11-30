//1行目のコメント以外はAIが作ったよ
class ImageOverlay {
  constructor(runtime) {
    this.runtime = runtime;
  }

  getInfo() {
    return {
      id: 'imageoverlay',
      name: '画像重ね合わせ',
      blocks: [
        {
          opcode: 'overlay',
          blockType: Scratch.BlockType.REPORTER,
          text: '画像 [URL1] に [URL2] を重ねたDataURL',
          arguments: {
            URL1: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://example.com/base.png' },
            URL2: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://example.com/overlay.png' }
          }
        }
      ]
    };
  }

  async overlay(args) {
    const url1 = String(args.URL1 || '').trim();
    const url2 = String(args.URL2 || '').trim();
    if (!url1 || !url2) return '';

    try {
      // 画像を読み込む
      const [img1, img2] = await Promise.all([
        fetch(url1).then(r => r.blob()).then(b => createImageBitmap(b)),
        fetch(url2).then(r => r.blob()).then(b => createImageBitmap(b))
      ]);

      // Canvas作成
      const canvas = new OffscreenCanvas(img1.width, img1.height);
      const ctx = canvas.getContext('2d');

      // 背景にURL1を描画
      ctx.drawImage(img1, 0, 0);

      // 上にURL2を描画（位置は左上合わせ）
      ctx.drawImage(img2, 0, 0);

      // DataURLを返す
      return canvas.convertToBlob().then(blob => {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      });
    } catch (e) {
      console.warn('overlay failed:', e);
      return '';
    }
  }
}

(function(Scratch) {
  Scratch.extensions.register(new ImageOverlay(Scratch.vm.runtime));
})(Scratch);
