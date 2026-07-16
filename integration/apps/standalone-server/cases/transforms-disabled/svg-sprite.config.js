export default {
  mode: 'standalone@server',
  name: 'remote-plain',
  input: '../../../../fixtures/icons/duotone.svg',
  transform: {
    removeSize: false,
    replaceColors: false,
    addTransition: false,
  },
  generatedNotice: false,
}
