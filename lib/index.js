import { extend } from "/util";

import extract from "./extract";
import swan2vue from "./swan2vue";

const COMPILER = {
  swan2vue,
  handle(folders, config) {
    return extract(folders, config);
  }
};

/** Compiler ç¼è¯å½æ°
 *
 * @var folder { Array, String } åä¸ªé¡µé¢æä»¶å¤¹
 * @var config.plat { String } required [ 'swan', 'wx', 'ali' ] è¢«ç¼è¯çå¹³å°
 * @var config.type { String } [ 'template', 'javascript', 'all' ] ç¼è¯ç±»å
 */
function convert(folder, config) {
  /** default var */

  let folders = folder instanceof Array ? folder : [folder];
  config = extend(
    {
      type: "all"
    },
    config
  );

  let res = [];

  /** logic */

  let compilerName = `${config.plat}2vue`,
    compilerHandle = config.type;
  let handle = COMPILER.handle(folders, config);
  handle.forEach(item => {
    res.push(COMPILER[compilerName][compilerHandle].convert(item));
  });

  /** return val */

  return res;
}

export default {
  convert
};
