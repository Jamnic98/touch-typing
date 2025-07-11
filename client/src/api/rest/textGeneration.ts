const baseUrl = import.meta.env.VITE_SERVER_BASE_URL

const url = `${baseUrl}/text/generate-practice-text`

export const fetchTypingString = async (): Promise<string> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const { text }: { text: string } = await response.json()
    return text
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(errorMessage)
    throw new Error(errorMessage)
  }
}
