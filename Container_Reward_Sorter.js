// ==UserScript==
// @name         重新排序补给箱中的战舰
// @name:zh-CN   重新排序补给箱中的战舰
// @name:en      Container Reward Sorter
// @namespace    https://github.com/shiraha777/Container_Reward_Sorter
// @version      2025-10-16
// @description  用于战舰世界军火库网页版的脚本，对补给箱中的战舰列表进行简易重新排序：未获得的在前，已获得的在后，方便玩家确认自己未获得和已获得的战舰。
// @description:zh-CN  用于战舰世界军火库网页版的脚本，对补给箱中的战舰列表进行简易重新排序：未获得的在前，已获得的在后，方便玩家确认自己未获得和已获得的战舰。
// @description:en  Sort the warships in containers: unobtained ones first, acquired ones last;
// @author       shiraha
// @match        https://armory.worldofwarships.asia/*
// @match        https://armory.worldofwarships.com/*
// @match        https://armory.worldofwarships.eu/*
// @icon         https://wows-web-static.wgcdn.co/metashop/1a69ae8c/favicon.png
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    let sorted = false;
    function sortLootboxItems() {
        console.log('checking...');
        const container = document.querySelector('.AutoDescription_items.AutoDescription_grid.AutoDescription_isLoaded');
        if (!container) return;

        console.log('start sort!');
        // 遍历 container 下的每个子<div>
        container.querySelectorAll(':scope > div').forEach(groupDiv => {
            const title = groupDiv.querySelector('.AutoDescription_groupTitle');

            // 找到所有卡片
            const items = Array.from(groupDiv.querySelectorAll('.LootboxRewardItemCard_item.AutoDescription_gridItem'));

            // 分类：未获得（没有 we-card__inventory）和已获得（有 we-card__inventory）
            const notOwned = items.filter(item => !item.querySelector('.we-card__inventory'));
            const owned = items.filter(item => item.querySelector('.we-card__inventory'));

            console.log("doing sort...")
            // 清空 groupDiv 中除标题外的内容
            Array.from(groupDiv.children).forEach(child => {
                if (child !== title) {
                    child.remove();
                }
            });

            // 重新插入：先未获得，再已获得
            notOwned.forEach(item => groupDiv.appendChild(item));
            owned.forEach(item => groupDiv.appendChild(item));
        });
        console.log('sorted!')
    }

    // 使用 MutationObserver 监听元素加载和移除
    const observer = new MutationObserver(() => {
        const target = document.querySelector('.AutoDescription_items.AutoDescription_grid.AutoDescription_isLoaded');
        if (target && !sorted) {
            sortLootboxItems();
            sorted = true;
        } else if (!target && sorted) {
            // 当元素消失时，重置 sorted
            console.log('target disappeared, reset sorted = false');
            sorted = false;
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
