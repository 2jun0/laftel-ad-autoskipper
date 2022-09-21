/** 실제 로딩될 mutead.js 파일을 dynamic import */
const dynamicImport = async () => {
  const src = chrome.runtime.getURL('js/content_scripts/mutead/mutead.js');
  const contentScript = await import(src);
  contentScript.main();
};

dynamicImport();
