import { CharacterProps } from 'components/Character'
import { TypedStatus } from 'types/global'

export const saveStats = () => {}

export const updateStats = async (
  charObjArray: CharacterProps[],
  typedStatus: TypedStatus,
  cursorIndex: number
) => {
  console.log('[userStats]', charObjArray, typedStatus, cursorIndex)
}
