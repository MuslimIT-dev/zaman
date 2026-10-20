import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { AuthService } from '@/gen/auth/v1/auth_pb';
import { UserService } from '@/gen/user/v1/user_pb';

const transport = createConnectTransport({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
});

export const authClient = createClient(AuthService, transport);
export const userClient = createClient(UserService, transport);