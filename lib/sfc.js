const fs = require('fs')
const path = require('path')

import swan2vueOptions from "./swan2vue/index"

const config = {
    swan2vueOptions,
}

let sfc = {
    compile (pageContent) {
        return new Promise((resolve, reject) => {
            console.log(pageContent)
        })
    }
}

export default sfc
