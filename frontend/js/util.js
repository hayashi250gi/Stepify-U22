// ユーティリティモジュール 画面要素の操作機能を提供

// 画面要素の子要素をすべて削除する機能を提供
export function clearElement(element) {

    while (element.firstChild) {

        element.removeChild(
            element.firstChild
        );
    }
}

// 画面要素の作成機能を提供
export function createTextElement(
    tagName,
    text
) {

    const element =
        document.createElement(tagName);

    element.textContent = text;

    return element;
}