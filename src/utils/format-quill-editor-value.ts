export const formatQuillEditorValue = (value?: string | null) => {
  return (
    value
      ?.split('\n')
      .map((line) => `<p>${line}</p>`)
      .join('') || ''
  );
};
