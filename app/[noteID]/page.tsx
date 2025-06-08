export default async function NotePage({params}: {params: {recipeID: string}}) {
  return (<h1>Note Page for: {params.recipeID}</h1>)
} 