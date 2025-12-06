-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-11-2025 a las 03:19:15
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `idatrestaurant`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `Listareservas` ()   select fechareserva,nombres,nombremessa,horainicio,motivo,tipopago
from mesa,cliente,reserva
where idcliente=cliente and idmesa=mesa$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `idcliente` int(11) NOT NULL,
  `dni` varchar(8) NOT NULL,
  `nombres` varchar(200) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `fechasistema` date NOT NULL,
  `usuario` int(2) NOT NULL,
  `estadocliente` int(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`idcliente`, `dni`, `nombres`, `telefono`, `correo`, `fechasistema`, `usuario`, `estadocliente`) VALUES
(1, '41322161', 'ARMANDO LOPEZ ALIAGA', '9898989', 'aliaga@gmail.com', '2025-07-01', 1, 1),
(2, '41542378', 'SUSANA VILLARAN PEREZ', '987654389', 'susanita@gmail.com', '2025-07-23', 1, 1),
(3, '31234254', 'pedro', '454545', 'amen@gmail.com', '2025-07-26', 1, 1),
(4, '31234222', 'pedro', '4545411999', 'amen111@gmail.com', '2025-07-26', 1, 1),
(6, '31554222', 'pedro', '45454555', 'amen555111@gmail.com', '2025-07-26', 1, 1),
(7, '1111111', 'juan', '985653234', 'juan@gmail.com', '2025-07-26', 1, 1),
(8, '3232323', 'CESAR AUGUSTO', '08090', 'carlo222s@hotmail.com', '2025-07-26', 1, 1),
(9, '23434234', 'fsdfsdf', '234234234', 'sandoya01@hotmail.com', '2025-07-26', 1, 1),
(10, '45434', 'fsdf', 'sdfsdfs', 'alvarezedu@gmail.com', '2025-07-26', 1, 1),
(13, '898989', 'ewrer', 'erer', 'carlos@hotmail.com', '2025-07-26', 1, 1),
(14, '448989', 'CESAR AUGUSTO', '34', 'sdsdsds@hotmail.com', '2025-07-26', 1, 1),
(15, '6661212', 'scsasd AUGUSTO', '3223454', 'carloqwqws@hotmail.com', '2025-07-26', 1, 1),
(16, '353434', 'DARWIN FREDY LOPEZ SANDOYA', '4554545', 'dadads@hotmail.com', '2025-07-26', 1, 1),
(17, 'ccsx', 'cczxczxz', 'zxczxc', 'alberto@hotmail.com', '2025-07-26', 1, 1),
(18, '56322161', 'mario ruiz', '878787878', 'carlo23s@hotmail.com', '2025-07-26', 1, 1),
(19, '12309878', 'maria parado', '54555', 'maria@gmail.com', '2025-11-29', 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mesa`
--

CREATE TABLE `mesa` (
  `idmesa` int(11) NOT NULL,
  `codigoinventario` varchar(10) NOT NULL,
  `nombremessa` varchar(10) NOT NULL,
  `descripcionmesa` varchar(150) NOT NULL,
  `ubicacionmesa` varchar(100) NOT NULL,
  `cantidadsillas` int(2) NOT NULL,
  `fecharegistro` date NOT NULL,
  `usuario` int(2) NOT NULL,
  `estadouso` int(2) NOT NULL,
  `estadogeneral` int(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mesa`
--

INSERT INTO `mesa` (`idmesa`, `codigoinventario`, `nombremessa`, `descripcionmesa`, `ubicacionmesa`, `cantidadsillas`, `fecharegistro`, `usuario`, `estadouso`, `estadogeneral`) VALUES
(1, '100725-1', 'Mesa 01', 'Mesa de Vidrio templado', 'Ventana izquierda', 6, '2025-07-10', 1, 1, 1),
(2, '100725-2', 'Mesa 02', 'Mesa de madera Caoba', 'Centro del ambiente', 4, '2025-07-10', 1, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `platos`
--

CREATE TABLE `platos` (
  `idplato` int(11) NOT NULL,
  `nombreplato` varchar(100) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `estadoplato` int(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `platos`
--

INSERT INTO `platos` (`idplato`, `nombreplato`, `categoria`, `estadoplato`) VALUES
(1, 'Ceviche de conchas Negras y mariscos', 'Afrodisiaco', 1),
(2, 'Patasca con cerdo', 'Plato Tipico', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva`
--

CREATE TABLE `reserva` (
  `idreserva` int(11) NOT NULL,
  `cliente` int(11) NOT NULL,
  `mesa` int(11) NOT NULL,
  `fechareserva` date NOT NULL,
  `horainicio` varchar(20) NOT NULL,
  `horafin` varchar(20) NOT NULL,
  `cantidadpersonas` int(2) NOT NULL,
  `motivo` varchar(200) NOT NULL,
  `tipopago` varchar(50) NOT NULL,
  `fechasistema` date NOT NULL,
  `usuario` int(2) NOT NULL,
  `estadoreserva` int(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reserva`
--

INSERT INTO `reserva` (`idreserva`, `cliente`, `mesa`, `fechareserva`, `horainicio`, `horafin`, `cantidadpersonas`, `motivo`, `tipopago`, `fechasistema`, `usuario`, `estadoreserva`) VALUES
(1, 1, 1, '2025-07-17', '10:00 pm', '11:00 pm', 4, 'Reunión de Trabajo', 'Tarjeta', '2025-07-17', 1, 1),
(2, 2, 2, '2025-07-17', '8:00 PM', '10:00 PM', 2, 'Declaración de Amor.', 'Efectivo', '2025-07-17', 1, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`idcliente`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD UNIQUE KEY `telefono` (`telefono`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `mesa`
--
ALTER TABLE `mesa`
  ADD PRIMARY KEY (`idmesa`),
  ADD UNIQUE KEY `nombremessa` (`nombremessa`),
  ADD UNIQUE KEY `codigoinventario` (`codigoinventario`);

--
-- Indices de la tabla `platos`
--
ALTER TABLE `platos`
  ADD PRIMARY KEY (`idplato`),
  ADD UNIQUE KEY `nombreplato` (`nombreplato`);

--
-- Indices de la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD PRIMARY KEY (`idreserva`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `idcliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `mesa`
--
ALTER TABLE `mesa`
  MODIFY `idmesa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `platos`
--
ALTER TABLE `platos`
  MODIFY `idplato` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `reserva`
--
ALTER TABLE `reserva`
  MODIFY `idreserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
