import jwt from 'jsonwebtoken';
import mg from 'mailgun-js';

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};

export const mailgun = () =>
  mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

export const payOrderEmailTemplate = (order) => {
  return `<h1> Thanks for shopping with us </h1>
    <p>
    Hi ${order.user.name}, </p>
    <p> We have finished processing your order. </p>
    <h2> [Order ${order._id}] (${order.createdAt
    .toString()
    .substring(0, 10)}) </h2>
    <table>
    <thead>
    <tr>
    <td><strong>Product</strong></td>
    <td><strong>Quantity</strong></td>
    <td><strong align="right">Price</strong></td>
    
    </thead>
    <tbody>
    ${order.orderItems
      .map(
        (item) => `<tr>
    <td align="center">${item.quantity}</td>
    <td align="right">GHS ${item.price}</td>
    </tr>`
      )
      .join('\n')}
    </tbody>
    <tfoot>
    <tr>
    <td colspan="2"> Items Price: </td>
    <td align="right"> GHS ${order.itemsPrice.toFixed(2)}</td>
    </tr>
    <tr>
    <td colspan="2"> Shipping Price: </td>
    <td align="right"> GHS ${order.shippingPrice.toFixed(2)}</td>
    </tr>
    <tr>
    <td colspan="2"> <strong> Total Price: </strong> </td>
    <td align="right"> GHS ${order.totalPrice.toFixed(2)}</td>
    </tr>
    <tr>
    <td colspan="2"> Payment Method: </td>
    <td align="right"> GHS ${order.paymentMethod}</td>
    </tr>
    </table>
    <h2>Shipping Address </h2>
    <p>
    ${order.shippingAddress.fullname}, <br />
    ${order.shippingAddress.address}, <br />
    ${order.shippingAddress.city}, <br />
    ${order.shippingAddress.country}, <br />
    ${order.shippingAddress.postalCode}, <br />
    </p>
    <hr />
    <p>
    Thanks for shipping with us. Kindly contact (+233 556567537) for all enquiries.
    See you soon
    @tekstore Ghana
    </p>
    `;
};
