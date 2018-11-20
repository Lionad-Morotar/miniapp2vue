const app = getApp();

Page({

    data: {
        msg: 'Hello World.',
        checked: true
    },
    dataStore: {
        msg: 'Hello World 2'
    },

    onShareAppMessage () {
        return {
            title: 'swan-template',
            path: `/pages/swan-template/swan-template`,
            success (res) {
                // è½¬åæå
            },
            fail (res) {
                // è½¬åå¤±è´¥
            }
        }
    },

    onUnload () {

        console.log('onUnload')

    },

    onLoad (options) {

        console.log('onLoad')

    },

    onReady () {

        console.log('onReady')

    },

    testclick (e) {
        console.log(e.target && e.target.dataset.testid)
    },

})
