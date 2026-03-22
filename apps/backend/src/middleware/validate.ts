import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validate =
  (schema: z.ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          status: "fail",
          message: "Validation failed",
          errors: err.issues.map(e => ({
            field: e.path[e.path.length - 1],
            message: e.message,
          })),
        });
        return;
      }
      next(err);
    }
  };
