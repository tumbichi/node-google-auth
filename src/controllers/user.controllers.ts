import { Request, Response } from "express";
import { UserEntity as User } from "../entities/UserEntity";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, username, email } = req.body;

    const user = new User();

    user.firstname = firstname;
    user.lastname = lastname;
    user.username = username;
    user.email = email;

    await user.save();

    return res.json(user);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res.json(
      users.map((user) => {
        const { password, ...restUser } = user;
        return restUser;
      })
    );
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname } = req.body;
    const { id } = req.params;

    const user = await User.findOneBy({ id: parseInt(req.params.id) });

    if (!user) return res.status(404).json("User does not exists");

    User.update({ id: parseInt(id) }, { firstname, lastname });

    return res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await User.delete({ id: parseInt(id) });

    if (result.affected === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findOneBy({ id: parseInt(id) });
    if (!user) return res.status(404).send("User not found");
    const { password, ...restUser } = user;
    return res.json(restUser);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};
