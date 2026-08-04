# FocusDay

一款简洁、专注的网页版待办事项提醒工具。把重要的事情记下来，用清晰的节奏完成每一天。

## 项目预览

> GitHub Pages 部署完成后，可在仓库首页右侧的 **Deployments** 中访问在线版本。

## 功能特性

- 创建、完成和删除待办事项
- 设置日期、时间、备注与优先级
- 按全部、今天、进行中和已完成筛选
- 通过浏览器 Notification API 提供到期提醒
- 使用 LocalStorage 在本地持久化数据
- 展示今日任务、完成数量与整体进度
- 适配桌面端和移动端

## 技术栈

- React 19
- Vite 8
- CSS3
- LocalStorage API
- Notification API
- GitHub Actions 与 GitHub Pages

## 本地运行

需要安装 Node.js 20 或更高版本。

```bash
git clone <your-repository-url>
cd focusday-todo
npm install
npm run dev
```

浏览器打开终端中显示的本地地址即可。

## 可用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 创建生产构建
npm run lint     # 检查代码
npm run preview  # 预览生产构建
```

## 浏览器提醒说明

点击页面右上角的“开启提醒”并授权后，FocusDay 会在任务到期时发送通知。通知通常要求 HTTPS 或 localhost 环境，并且当前版本需要页面保持打开。

## 数据与隐私

所有待办数据仅保存在当前浏览器的 LocalStorage 中，不会上传到服务器。清除浏览器网站数据会同时移除待办记录。

## 后续计划

- 支持编辑已有待办
- 增加周期性任务
- 增加数据导入与导出
- 使用 Service Worker 改进后台提醒

## License

本项目采用 [MIT License](./LICENSE)。
