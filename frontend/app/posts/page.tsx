'use client';
import { useState, useEffect } from 'react';
import api from '@/libs/api';
import toast from 'react-hot-toast';

type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  // Lấy danh sách bài viết từ server
  const fetchPosts = async () => {
    const res = await api.get('/api/posts');
    setPosts(res.data);
  };

  useEffect(() => { fetchPosts(); }, []);

  // Đăng bài mới
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await toast.promise(
        api.post('/api/posts', { title, content, author }),
        {
          loading: 'Đang đăng bài...',
          success: 'Đăng bài thành công!',
          error: 'Đăng bài thất bại!',
        }
      );
      setTitle(''); setContent(''); setAuthor('');
      fetchPosts();
    } catch (err: any) {
      console.error(err.response?.data?.error);
    }
  };

  // Xóa bài viết
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn chắc chắn muốn xoá bài viết này?')) return;
    try {
      await api.delete(`/api/posts/${id}`);
      // Optimistic update: cập nhật UI ngay, không cần gọi lại API
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Đã xoá bài viết', { icon: '🗑️' });
    } catch (err) {
      toast.error('Xoá thất bại, thử lại!');
      fetchPosts(); // rollback
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📝 Quản lý Bài Viết</h1>

      {/* Form đăng bài */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-8 bg-gray-50 p-4 rounded-lg">
        <input
          className="w-full border rounded p-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Tiêu đề"
          required
        />
        <textarea
          className="w-full border rounded p-2"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Nội dung"
          required
        />
        <input
          className="w-full border rounded p-2"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="Tác giả"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Đăng bài
        </button>
      </form>

      {/* Danh sách bài viết */}
      {posts.map(p => (
        <div key={p.id} className="flex justify-between items-center p-3 border rounded mb-2">
          <div>
            <h3 className="font-bold">{p.title}</h3>
            <p className="text-sm text-gray-500">{p.author} · {p.content}</p>
          </div>
          <button
            onClick={() => handleDelete(p.id)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Xoá
          </button>
        </div>
      ))}
    </div>
  );
}