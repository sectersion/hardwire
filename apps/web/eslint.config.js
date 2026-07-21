const { dirname } = require("path")
const { FlatCompat } = require("@eslint/eslintrc")

const compat = new FlatCompat({ baseDirectory: dirname(__filename) })

const eslintConfig = [...compat.extends("next/core-web-vitals")]

module.exports = eslintConfig
