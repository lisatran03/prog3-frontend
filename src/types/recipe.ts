export interface Recipe {
  id: number
  title: string
  description: string
  category: string
  imageUrl?: string   // optional, da Backend sie nicht liefert
  time?: string    // optional
  level?: string   // optional
}
