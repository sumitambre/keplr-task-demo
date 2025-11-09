import { registerAs } from '@nestjs/config';

export default registerAs('throttle', () => ({
  ttl: 60,
  limit: 10,
}));
