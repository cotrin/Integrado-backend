import { Request, Response } from 'express'

import { db } from '../../prisma'


export async function getAllUniversities(req: Request, res: Response) {
    const { country, page = '1' }: { country?: string, page?: string } = req.query

    const universities = await db.university.findMany({
        select: {
            id: true,
            name: true,
            country: true,
            state_province: true
        },
        where: {
            country: {
                equals: country,
                mode: 'insensitive'
            }
        },
        take: 20,
        skip: (Number(page) - 1) * 20,

    })

    const response = {
        page: Number(page),
        universities,
        amount: universities.length
    }

    res.json(response)
}