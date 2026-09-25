import type { Metadata } from 'next';
export const metadata:Metadata={title:'申请管理｜轻井泽国际艺术村',robots:{index:false,follow:false,nocache:true},referrer:'no-referrer'};
export default function ManageLayout({children}:{children:React.ReactNode}){return <div className="manage-shell"><header className="manage-header"><a href="/manage/applications">K／轻井泽国际艺术村 <span>申请管理</span></a><a href="/signout-with-chatgpt?return_to=%2F">退出登录</a></header><main>{children}</main><footer>仅限获授权的筹备团队成员 · 资料仅用于申请评估与联络</footer></div>;}
