import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))

function loadTypeScriptModule(relativePath) {
  const filename = path.resolve(testDirectory, relativePath)
  const source = fs.readFileSync(filename, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2017
    },
    fileName: filename
  }).outputText
  const loadedModule = { exports: {} }
  new Function('exports', 'module', output)(loadedModule.exports, loadedModule)
  return loadedModule.exports
}

const { normalizeOrderPaymentStatus } = loadTypeScriptModule('../src/shared/order-payment-status.ts')

test('recognizes every documented generic order status', () => {
  assert.equal(normalizeOrderPaymentStatus({ status: 0 }).status, 'pending')
  assert.equal(normalizeOrderPaymentStatus({ status: 1 }).status, 'paid')
  assert.equal(normalizeOrderPaymentStatus({ status: 2 }).status, 'paid')
  assert.equal(normalizeOrderPaymentStatus({ status: 3 }).status, 'cancelled')
})

test('prefers definitive payment evidence and terminal status text', () => {
  assert.equal(normalizeOrderPaymentStatus({ status: 0, pay_time: '2026-07-14 10:00:00' }).status, 'paid')
  assert.equal(normalizeOrderPaymentStatus({ status_text: '支付失败' }).status, 'failed')
  assert.equal(normalizeOrderPaymentStatus({ status_text: '订单已关闭' }).status, 'cancelled')
})
