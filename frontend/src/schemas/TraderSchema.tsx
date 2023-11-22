import * as Yup from 'yup'

export const TraderSchema = Yup.object().shape({
  name: Yup.string().min(3, 'Too small!').required('Required field'),
  leadermark: Yup.string().min(10, 'Too small!').required('Required field'),
  note: Yup.string().min(10, 'Too small!')
})
