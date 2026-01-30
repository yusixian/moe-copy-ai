/**
 * PostCSS 插件: 将 rem 单位转换为基于 CSS 变量的 calc() 表达式
 */

const remRE = /(-?[\d.]+)rem/g

module.exports = (opts = {}) => {
  const varName = opts.varName || "--moe-base-font-size"

  return {
    postcssPlugin: "postcss-rem-to-var",
    Declaration(decl) {
      if (remRE.test(decl.value)) {
        decl.value = decl.value.replace(remRE, (match, num) => {
          // 如果是 1rem,直接使用变量
          if (num === "1") {
            return `var(${varName})`
          }
          // 否则使用 calc()
          return `calc(var(${varName}) * ${num})`
        })
      }
    }
  }
}

module.exports.postcss = true
