import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    street: string;

    @Column({ type: 'varchar', length: 255 })
    city: string;

    @Column({ type: 'varchar', length: 10 })
    zipCode: string;
}