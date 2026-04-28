'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/libs/api';
import toast from 'react-hot-toast';

type Comment = {
  id: number;
  author: string;
  content: string;
  createdAt: string;
};

export default function Comments({ postId }: { postId: number }) {
  const queryClient = useQueryClient();
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [open, setOpen] = useState(false);

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: () => api.get(`/api/posts/${postId}/comments`).then(r => r.data),
    enabled: open, // chỉ fetch khi mở
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => api.post(`/api/posts/${postId}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Đã thêm bình luận!');
      setAuthor(''); setContent('');
    },
    onError: () => toast.error('Thêm bình luận thất bại!'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Đã xoá bình luận');
    },
  });

  return (
    <div className="mt-2">
      <button onClick={() => setOpen(!open)}
        className="text-xs text-gray-400 hover:text-gray-600">
        💬 {open ? 'Ẩn bình luận' : 'Xem bình luận'}
      </button>

      {open && (
        <div className="mt-2 pl-3 border-l-2 border-gray-200">
          {/* Form thêm comment */}
          <div className="flex gap-2 mb-3">
            <input className="border rounded p-1 text-sm flex-1" value={author}
              onChange={e => setAuthor(e.target.value)} placeholder="Tên" />
            <input className="border rounded p-1 text-sm flex-2 w-full" value={content}
              onChange={e => setContent(e.target.value)} placeholder="Bình luận..." />
            <button
              onClick={() => addMutation.mutate({ author, content })}
              className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
              Gửi
            </button>
          </div>

          {/* Danh sách comment */}
          {comments.length === 0
            ? <p className="text-xs text-gray-400">Chưa có bình luận nào.</p>
            : comments.map(c => (
              <div key={c.id} className="flex justify-between items-start mb-1">
                <p className="text-sm">
                  <span className="font-medium">{c.author}:</span> {c.content}
                </p>
                <button onClick={() => deleteMutation.mutate(c.id)}
                  className="text-xs text-red-400 hover:text-red-600 ml-2">✕</button>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}