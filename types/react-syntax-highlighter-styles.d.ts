// Thème hljs importé par son chemin CommonJS (pas de déclaration fournie par @types/react-syntax-highlighter).
// Le module n'exporte qu'un « default » : un import nommé { tomorrow } donnait undefined (thème non appliqué).
declare module 'react-syntax-highlighter/dist/styles/tomorrow' {
  const style: Record<string, React.CSSProperties>;
  export default style;
}
