<script>
    // 全局变量
    let answerRecord = {
        total: 0, // 总题数
        correct: 0 // 答对题数
    };
    let currentQuestionIndex = 0; // 当前显示的题目索引（从0开始）
    let allQuestionCards = []; // 所有题目卡片集合
    let allNavItems = []; // 所有导航题号元素集合
    const customTip = document.getElementById('customTip'); // 自定义提示框实例
    const prevBtn = document.getElementById('prevBtn'); // 左侧上一题按钮
    const sidebarNextBtn = document.getElementById('sidebarNextBtn'); // 右侧下一题按钮

    // 页面加载完成后初始化功能
    window.onload = function() {
        // 1. 初始化变量，获取所有题目卡片
        allQuestionCards = Array.from(document.querySelectorAll('.question-card'));
        answerRecord.total = allQuestionCards.length;
        document.getElementById('totalCount').innerText = `总答题数：${answerRecord.total}题`;

        // 2. 动态生成左侧题号导航
        generateQuestionNav();

        // 3. 显示第一题，更新答题进度和导航激活状态
        showCurrentQuestion();

        // 4. 更新侧边按钮启用/禁用状态
        updateSidebarBtnStatus();

        // 5. 为所有单选选项绑定即时判断事件
        const allRadioInputs = document.querySelectorAll('input[type="radio"]');
        allRadioInputs.forEach(input => {
            input.addEventListener('change', function() {
                // 禁用当前题目的所有选项（防止重复选择）
                const currentQuestion = this.closest('.question-card');
                const currentRadioInputs = currentQuestion.querySelectorAll('input[type="radio"]');
                currentRadioInputs.forEach(radio => radio.disabled = true);

                // 获取当前题目相关数据
                const questionId = currentQuestion.getAttribute('data-question-id');
                const answerInfo = currentQuestion.querySelector('.answer-info');
                const correctAnswer = answerInfo.getAttribute('data-correct-answer');
                const userAnswer = this.value;
                const analysis = answerInfo.innerText;

                // 高亮显示正确/错误选项
                highlightOption(currentQuestion, correctAnswer, userAnswer);

                // 填充解析区域并显示
                const analysisContent = document.getElementById(`analysisContent${questionId}`);
                const analysisArea = document.getElementById(`analysis${questionId}`);
                analysisContent.innerText = analysis;
                analysisArea.style.display = 'block';

                // 答题结果判断，显示自定义提示框
                if (userAnswer === correctAnswer) {
                    currentQuestion.setAttribute('data-is-correct', 'true');
                    showCustomTip('correct', '回答正确！', '恭喜你，掌握了该知识点～');
                } else {
                    currentQuestion.setAttribute('data-is-correct', 'false');
                    showCustomTip('error', '回答错误', `正确答案是：${correctAnswer}，请仔细查看下方解析哦～`);
                }

                // 显示下一题按钮（最后一题显示提交按钮）
                if (currentQuestionIndex < answerRecord.total - 1) {
                    document.getElementById('nextBtn').style.display = 'block';
                } else {
                    document.getElementById('submitAllBtn').style.display = 'block';
                }
            });
        });

        // 6. 绑定自定义提示框确定按钮事件
        document.getElementById('tipConfirm').addEventListener('click', function() {
            customTip.style.display = 'none';
        });

        // 7. 绑定底部下一题按钮事件
        document.getElementById('nextBtn').addEventListener('click', function() {
            goToNextQuestion();
            // 隐藏下一题按钮
            this.style.display = 'none';
        });

        // 8. 绑定右侧侧边栏上下题按钮事件
        prevBtn.addEventListener('click', goToPrevQuestion);
        sidebarNextBtn.addEventListener('click', goToNextQuestion);

        // 9. 绑定提交按钮事件，统计最终结果
        document.getElementById('submitAllBtn').addEventListener('click', function() {
            // 重新统计答对题数
            answerRecord.correct = 0;
            allQuestionCards.forEach(card => {
                const isCorrect = card.getAttribute('data-is-correct');
                if (isCorrect === 'true') {
                    answerRecord.correct++;
                }
            });

            // 计算正确率（保留2位小数，避免除零错误）
            const accuracy = answerRecord.total > 0 
                ? ((answerRecord.correct / answerRecord.total) * 100).toFixed(2) 
                : '0.00';

            // 更新统计结果页面
            document.getElementById('correctCount').innerText = `答对题数：${answerRecord.correct}题`;
            document.getElementById('accuracyRate').innerText = `正确率：${accuracy}%`;

            // 显示统计区域
            document.getElementById('resultContainer').style.display = 'block';

            // 显示最终结果自定义提示框
            showCustomTip('correct', '闯关完成！', `总题数：${answerRecord.total}题\n答对题数：${answerRecord.correct}题\n正确率：${accuracy}%`);
        });
    };

    // 新增：动态生成左侧题号导航
    function generateQuestionNav() {
        const navList = document.getElementById('navList');
        navList.innerHTML = ''; // 清空原有内容

        for (let i = 0; i < allQuestionCards.length; i++) {
            const navItem = document.createElement('a');
            navItem.className = 'nav-item';
            navItem.dataset.index = i;
            navItem.innerText = i + 1;

            // 绑定题号点击跳转事件
            navItem.addEventListener('click', function() {
                const targetIndex = parseInt(this.dataset.index);
                goToSpecificQuestion(targetIndex);
            });

            navList.appendChild(navItem);
            allNavItems.push(navItem);
        }
    }

    // 新增：跳转到指定题号
    function goToSpecificQuestion(targetIndex) {
        if (targetIndex < 0 || targetIndex >= allQuestionCards.length) return;

        // 隐藏当前题
        allQuestionCards[currentQuestionIndex].classList.remove('active');
        allNavItems[currentQuestionIndex].classList.remove('active');

        // 更新当前索引
        currentQuestionIndex = targetIndex;

        // 显示目标题
        showCurrentQuestion();

        // 更新侧边按钮状态
        updateSidebarBtnStatus();
    }

    // 新增：跳转到上一题
    function goToPrevQuestion() {
        if (currentQuestionIndex > 0) {
            goToSpecificQuestion(currentQuestionIndex - 1);
        }
    }

    // 新增：跳转到下一题
    function goToNextQuestion() {
        if (currentQuestionIndex < allQuestionCards.length - 1) {
            goToSpecificQuestion(currentQuestionIndex + 1);
            // 隐藏底部下一题按钮
            document.getElementById('nextBtn').style.display = 'none';
        }
    }

    // 新增：更新侧边按钮启用/禁用状态
    function updateSidebarBtnStatus() {
        // 上一题按钮：第一题禁用，其余启用
        if (currentQuestionIndex === 0) {
            prevBtn.classList.remove('enabled');
        } else {
            prevBtn.classList.add('enabled');
        }

        // 下一题按钮：最后一题禁用，其余启用
        if (currentQuestionIndex === allQuestionCards.length - 1) {
            sidebarNextBtn.classList.remove('enabled');
        } else {
            sidebarNextBtn.classList.add('enabled');
        }
    }

    // 辅助函数1：显示当前题目并更新进度、导航激活状态
    function showCurrentQuestion() {
        if (allQuestionCards[currentQuestionIndex] && allNavItems[currentQuestionIndex]) {
            // 激活当前题目
            allQuestionCards[currentQuestionIndex].classList.add('active');
            // 激活当前导航题号
            allNavItems[currentQuestionIndex].classList.add('active');
            // 更新答题进度提示
            document.getElementById('questionProgress').innerText = 
                `当前：第${currentQuestionIndex + 1}题 / 共${answerRecord.total}题`;
        }
    }

    // 辅助函数2：显示自定义提示框
    function showCustomTip(type, title, content) {
        const tipTitle = document.getElementById('tipTitle');
        const tipContent = document.getElementById('tipContent');

        // 重置提示框样式
        customTip.className = 'custom-tip';
        customTip.classList.add(`${type}-tip`);

        // 填充内容
        tipTitle.innerText = title;
        tipContent.innerText = content;

        // 显示提示框
        customTip.style.display = 'block';
    }

    // 辅助函数3：高亮显示正确/错误选项
    function highlightOption(questionCard, correctAnswer, userAnswer) {
        const optionItems = questionCard.querySelectorAll('.option-item');
        optionItems.forEach(item => {
            const input = item.querySelector('input');
            if (input.value === correctAnswer) {
                // 正确选项高亮
                item.classList.add('correct');
            } else if (input.value === userAnswer && userAnswer !== correctAnswer) {
                // 错误选项标记
                item.classList.add('incorrect');
            }
        });
    }
</script>