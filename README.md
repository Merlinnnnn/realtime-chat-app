Chatty - Ứng dụng Chat Realtime
Mô tả
Chatty là ứng dụng chat realtime hỗ trợ chat cá nhân, chat nhóm, gửi lời mời kết bạn, thông báo và cập nhật trạng thái trực tuyến. Ứng dụng sử dụng React cho frontend, Node.js/Express cho backend, MongoDB cho cơ sở dữ liệu và Socket.io để realtime.
Tính năng nổi bật
Đăng ký, đăng nhập, xác thực người dùng
Chat cá nhân và chat nhóm realtime
Gửi, nhận, chấp nhận hoặc từ chối lời mời kết bạn
Thông báo realtime khi có lời mời kết bạn hoặc được chấp nhận kết bạn
Tạo nhóm, thêm thành viên, đổi ảnh đại diện nhóm
Cập nhật trạng thái online/offline
Giao diện hiện đại, responsive
Công nghệ sử dụng
Frontend: React, Zustand, TailwindCSS, Axios, Socket.io-client
Backend: Node.js, Express, MongoDB, Mongoose, Socket.io, Cloudinary (upload ảnh)
Realtime: Socket.io
Cấu trúc dự án:
my-chat-app/
  backend/      # Source code backend (API, socket, models, controllers)
  frontend/     # Source code frontend (React app)
Hướng dẫn cài đặt & chạy dự án
1. Clone dự án
git clone <https://github.com/Merlinnnnn/realtime-chat-app.git>
cd my-chat-app
2. Cài đặt backend
cd backend
npm install
Tạo file .env trong thư mục backend với các biến môi trường cần thiết (ví dụ: MONGO_URI, JWT_SECRET, CLOUDINARY configs...)
3. Chạy backend
npm run dev
Mặc định backend chạy ở http://localhost:5000
4. Cài đặt frontend
cd ../frontend
npm install
5. Chạy frontend
npm run dev
Mặc định frontend chạy ở http://localhost:5173
6. Truy cập ứng dụng
Mở trình duyệt và truy cập: http://localhost:5173
Ảnh màn hình (Screenshot)
Ảnh nhắn tin
![Ảnh mô tả](assets/chat.png)
Ảnh nhắn tin nhóm
![Ảnh mô tả](assets/group-chat.png)
Ảnh profile
![Ảnh mô tả](assets/profile.png)
Ảnh setting
![Ảnh mô tả](assets/setting.png)
Đóng góp
Mọi đóng góp, báo lỗi hoặc ý tưởng mới đều được hoan nghênh! Hãy tạo issue hoặc pull request.