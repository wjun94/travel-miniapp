import { useState, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { BottomSheet, Modal } from '@/components'
import { useRequest } from 'ahooks'
import {
  getAccountList,
  getAccountSummary,
  addAccount,
  deleteAccount,
  deleteAccountBook,
  updateAccount,
  ACCOUNT_CATEGORIES,
  TARGET_TYPE_NAMES,
  type Accounting,
  type TargetType,
} from '@/api/accounting'
import { formatTime } from '@/utils'

// 分类图标与配色
const CATEGORY_STYLE: Record<string, { icon: string; cls: string }> = {
  交通: { icon: 'icon-bus', cls: 'bg-blue-100 text-blue-600' },
  餐饮: { icon: 'icon-food', cls: 'bg-orange-100 text-orange-500' },
  住宿: { icon: 'icon-accom', cls: 'bg-violet-100 text-violet-600' },
  门票: { icon: 'icon-ticket', cls: 'bg-green-100 text-green-600' },
  购物: { icon: 'icon-shop', cls: 'bg-pink-100 text-pink-500' },
  其他: { icon: 'icon-notepad', cls: 'bg-stone-100 text-stone-500' },
}

export default function AccountingListPage() {
  const router = useRouter()
  const targetType = (router.params.targetType || 'trip') as TargetType
  const targetId = router.params.targetId || ''
  const name = decodeURIComponent(router.params.name || '')
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Accounting | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Accounting | null>(null)
  const [deleteBookVisible, setDeleteBookVisible] = useState(false)

  // 动态设置原生导航栏标题
  useEffect(() => {
    Taro.setNavigationBarTitle({ title: name ? `账本 · ${name}` : '记账本' })
  }, [name])

  // 明细 + 汇总并行加载
  const { data: list = [], loading, refresh } = useRequest(() => getAccountList(targetType, targetId))
  const { data: summary, refresh: refreshSummary } = useRequest(() => getAccountSummary(targetType, targetId))

  useDidShow(() => {
    refresh()
    refreshSummary()
  })

  // 添加表单状态
  const [category, setCategory] = useState<(typeof ACCOUNT_CATEGORIES)[number]>(ACCOUNT_CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    const value = Number(amount)
    if (!value || value <= 0) {
      Taro.showToast({ title: '请输入正确的金额', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      if (editTarget) {
        await updateAccount(editTarget.id, { category, amount: value, note: note.trim() })
      } else {
        await addAccount({
          targetType,
          targetId,
          targetName: targetType === 'custom' ? name : undefined,
          category,
          amount: value,
          note: note.trim(),
        })
      }
      Taro.showToast({ title: '已保存', icon: 'success' })
      setShowAdd(false)
      setEditTarget(null)
      setAmount('')
      setNote('')
      refresh()
      refreshSummary()
    } catch { /* ignore */ } finally {
      setSubmitting(false)
    }
  }

  // 打开编辑表单（预填该条记录）
  const handleEdit = (item: Accounting) => {
    setCategory(item.category as (typeof ACCOUNT_CATEGORIES)[number])
    setAmount(String(item.amount))
    setNote(item.note || '')
    setEditTarget(item)
    setShowAdd(true)
  }

  // 打开新增表单
  const handleOpenAdd = () => {
    setEditTarget(null)
    setAmount('')
    setNote('')
    setShowAdd(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteAccount(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
      refreshSummary()
    } catch { /* ignore */ }
  }

  // 删除整本账本（含全部记账记录），删除后返回账本列表
  const handleDeleteBook = () => {
    setDeleteBookVisible(true)
  }
  const handleDeleteBookConfirm = async () => {
    try {
      await deleteAccountBook(targetType, targetId)
      setDeleteBookVisible(false)
      Taro.showToast({ title: '已删除', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 400)
    } catch {
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  return (
    <View className='min-h-screen bg-[#FAFAF9] px-4 pb-28 font-sans'>
      {/* 汇总卡 */}
      <View className='bg-white rounded-2xl px-5 py-5 shadow-sm mb-4'>
        <View className='flex flex-row items-end justify-between'>
          <View>
            <Text className='text-[26px] text-stone-400 block mb-1.5'>总支出</Text>
            <Text className='text-48px font-black text-stone-800 tracking-tight'>¥{(summary?.totalAmount || 0).toFixed(2)}</Text>
          </View>
          <View className='text-right flex flex-col items-end'>
            <Text className='text-[26px] text-stone-400 mb-1.5'>共 {summary?.count || 0} 笔</Text>
            <View className='flex flex-row items-center'>
              <Text className='text-[22px] px-2.5 py-1 rounded-full inline-block bg-orange-100 text-orange-600'>
                {TARGET_TYPE_NAMES[targetType] || targetType}
              </Text>
            </View>
          </View>
        </View>
        {/* 分类金额 */}
        {summary && Object.keys(summary.categoryStat).length > 0 && (
          <View className='flex flex-row flex-wrap gap-2 mt-3 pt-3 border-t border-stone-100'>
            {Object.entries(summary.categoryStat).map(([cat, val]) => (
              <View key={cat} className='bg-stone-50 rounded-full px-2.5 py-1'>
                <Text className='text-[22px] text-stone-500'>{cat} ¥{val.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 记录列表 */}
      {loading ? (
        <View className='py-20 flex items-center justify-center'>
          <Text className='text-[28px] text-stone-400'>加载中...</Text>
        </View>
      ) : list.length === 0 ? (
        <View className='py-20 flex flex-col items-center justify-center space-y-2 text-stone-400'>
          <Text className='iconfont icon-notepad text-72px' />
          <Text className='text-[26px]'>暂无记账，点下方"记一笔"</Text>
        </View>
      ) : (
        <View className='flex flex-col'>
          {list.map((item) => {
            const style = CATEGORY_STYLE[item.category] || CATEGORY_STYLE.其他
            return (
              <View
                key={item.id}
                className='bg-white rounded-2xl px-4 py-3 mb-3 shadow-sm flex flex-row items-center transition-colors'
              >
                <View className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.cls}`}>
                  <Text className={`iconfont ${style.icon} text-32px`} />
                </View>
                <View className='flex-1 ml-3 overflow-hidden'>
                  <View className='flex flex-row items-center'>
                    <Text className='font-bold text-stone-800 text-[26px]'>{item.category}</Text>
                    {item.note && <Text className='text-[24px] text-stone-400 ml-2 truncate'>{item.note}</Text>}
                  </View>
                  <Text className='text-[22px] text-stone-400 mt-0.5'>{formatTime(item.consumedAt)}</Text>
                </View>
                <Text className='ml-2 font-black text-stone-800 text-[28px] flex-shrink-0'>-¥{item.amount.toFixed(2)}</Text>
                <View className='ml-3 flex flex-col items-center justify-center flex-shrink-0'>
                  <Text className='iconfont icon-edit text-[32px] text-stone-400 active:opacity-60' onClick={() => handleEdit(item)} />
                  <Text className='iconfont icon-remove text-[32px] text-red-400 mt-2 active:opacity-60' onClick={() => setDeleteTarget(item)} />
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* 底部操作栏：左侧删除账本，右侧记一笔 */}
      <View className='fixed bottom-8 inset-x-4 flex flex-row items-center gap-3'>
        <View
          className='flex-1 bg-white text-red-500 rounded-full py-3 shadow-lg flex flex-row items-center justify-center active:opacity-80 border border-red-100'
          onClick={handleDeleteBook}
        >
          <Text className='iconfont icon-remove text-28px mr-1' />
          <Text className='text-[26px] font-bold'>删除账本</Text>
        </View>
        <View
          className='flex-1 bg-orange-500 text-white rounded-full py-3 shadow-lg flex flex-row items-center justify-center active:opacity-80'
          onClick={handleOpenAdd}
        >
          <Text className='iconfont icon-plus text-32px mr-1' />
          <Text className='text-[28px] font-bold'>记一笔</Text>
        </View>
      </View>

      {/* 添加表单 */}
      <BottomSheet visible={showAdd} title={editTarget ? '编辑记账' : '记一笔'} onClose={() => { setShowAdd(false); setEditTarget(null) }}>
        <View className='px-6 pb-8 pt-2'>
          {/* 分类选择 */}
          <View className='flex flex-row flex-wrap gap-3 mb-5'>
            {ACCOUNT_CATEGORIES.map((cat) => (
              <View
                key={cat}
                className={`px-4 py-1.5 rounded-full text-[26px] transition-colors ${category === cat ? 'bg-orange-500 text-white font-bold' : 'bg-stone-100 text-stone-600'}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </View>
            ))}
          </View>

          {/* 金额 */}
          <View className='bg-stone-50 rounded-xl px-4 py-3 mb-4 flex flex-row items-center'>
            <Text className='text-40px font-black text-stone-800 mr-2'>¥</Text>
            <Input
              className='flex-1 text-40px font-bold text-stone-800'
              type='digit'
              placeholder='0.00'
              placeholderClass='text-stone-300'
              value={amount}
              onInput={(e) => setAmount(e.detail.value)}
            />
          </View>

          {/* 备注 */}
          <View className='bg-stone-50 rounded-xl px-4 py-3 mb-6'>
            <Input
              className='text-[26px] text-stone-800'
              placeholder='备注（可选）'
              placeholderClass='text-stone-300'
              value={note}
              onInput={(e) => setNote(e.detail.value)}
            />
          </View>

          <View
            className={`bg-orange-500 text-white text-center text-[30px] font-bold rounded-xl py-3 active:opacity-80 ${submitting ? 'opacity-60' : ''}`}
            onClick={handleSubmit}
          >
            保存
          </View>
        </View>
      </BottomSheet>

      {/* 删除确认 */}
      <Modal visible={!!deleteTarget} title='删除这笔记账？' onCancel={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm}>
        <Text className='text-[26px] text-stone-500'>
          {deleteTarget?.category} ¥{deleteTarget?.amount.toFixed(2)}
          {deleteTarget?.note ? ` · ${deleteTarget.note}` : ''}
        </Text>
      </Modal>

      {/* 删除整本账本确认 */}
      <Modal
        visible={deleteBookVisible}
        title='删除账本'
        confirmText='删除'
        onCancel={() => setDeleteBookVisible(false)}
        onConfirm={handleDeleteBookConfirm}
      >
        <Text className='text-[26px] text-stone-500 leading-relaxed'>
          将删除"{name || '该账本'}"及其全部记账记录，确定删除吗？
        </Text>
      </Modal>
    </View>
  )
}
