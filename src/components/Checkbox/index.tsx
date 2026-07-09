import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import { CommonEvent } from '@tarojs/components/types/common';

export interface CheckboxProps {
    /** 是否选中（受控） */
    checked?: boolean;
    /** 默认是否选中（非受控） */
    defaultChecked?: boolean;
    /** 状态改变回调 */
    onChange?: (checked: boolean, event: CommonEvent) => void;
    /** 是否禁用 */
    disabled?: boolean;
    /** 文本内容 */
    label?: string;
    /** 文本位置，默认在右边 */
    labelPosition?: 'left' | 'right';
    /** 最外层自定义类名 */
    className?: string;
    /** 自定义文本类名 */
    labelClassName?: string;
    /** 自定义选中图标的 Tailwind 颜色类，默认鼠尾草绿 */
    activeColorClass?: string;
    /** 自定义未选中图标的 Tailwind 颜色类，默认浅灰 */
    inactiveColorClass?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    checked: controlledChecked,
    defaultChecked = false,
    onChange,
    disabled = false,
    label,
    labelPosition = 'right',
    className = '',
    labelClassName = '',
    activeColorClass = 'text-[#10B981]', // 默认使用你清单页的鼠尾草绿
    inactiveColorClass = 'text-stone-300',
}) => {
    // 兼顾受控与非受控模式
    const isControlled = controlledChecked !== undefined;
    const [localChecked, setLocalChecked] = useState(defaultChecked);

    useEffect(() => {
        if (isControlled) {
            setLocalChecked(!!controlledChecked);
        }
    }, [controlledChecked, isControlled]);

    const handleClick = (e: CommonEvent) => {
        if (disabled) return;

        const nextChecked = !localChecked;

        if (!isControlled) {
            setLocalChecked(nextChecked);
        }

        onChange?.(nextChecked, e);
    };

    // 动态拼装图标类名
    const iconClass = localChecked
        ? `iconfont icon-icon-circle_s ${activeColorClass}`
        : `iconfont icon-icon-circle_n ${inactiveColorClass}`;

    return (
        <View
            onClick={handleClick}
            className={`
        inline-flex flex-row items-center justify-center
        transition-all duration-200 ease-in-out
        ${disabled ? 'opacity-40 pointer-events-none' : 'active:opacity-80'}
        ${className}
      `}
        >
            {/* Label 在左侧 */}
            {label && labelPosition === 'left' && (
                <Text className={`mr-2.5 text-sm tracking-wide text-stone-700 font-medium ${labelClassName}`}>
                    {label}
                </Text>
            )}

            {/* 复选框图标核心 */}
            <View className="flex items-center justify-center text-[#10B981] transition-transform duration-150 ease-out active:scale-95">
                <Text className={`${iconClass} block leading-none`} />
            </View>

            {/* Label 在右侧 */}
            {label && labelPosition === 'right' && (
                <Text className={`ml-2.5 text-sm tracking-wide text-stone-700 font-medium ${labelClassName}`}>
                    {label}
                </Text>
            )}
        </View>
    );
};

export default Checkbox;