import { Session } from "next-auth";

class UserService {

    async getSelf(session: Session | null) {
        if (!session)
            return undefined

        const user = await prisma.user.findUnique({
            where: { id: session.user?.id }
        });

        return user
    }
}

const userService = new UserService()
export default userService